package br.com.agroconnect;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
class NegocioIntegrationTest {
    static final EmbeddedPostgres pg;
    static {
        // Os testes usam TCP local; não precisam criar um socket Unix.
        try { pg=EmbeddedPostgres.builder().setServerConfig("unix_socket_directories", "").start(); }
        catch (IOException erro) { throw new ExceptionInInitializerError(erro); }
    }
    @DynamicPropertySource static void configurar(DynamicPropertyRegistry registro) {
        registro.add("spring.datasource.url",()->pg.getJdbcUrl("postgres","postgres"));
        registro.add("spring.datasource.username",()->"postgres");
        registro.add("spring.datasource.password",()->"postgres");
    }
    @LocalServerPort int porta;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @MockitoBean SupabaseAuth auth;
    static final UUID PRODUTOR=UUID.fromString("00000000-0000-0000-0000-000000000001");
    static final UUID PRODUTOR2=UUID.fromString("00000000-0000-0000-0000-000000000002");
    static final UUID CONSUMIDOR=UUID.fromString("00000000-0000-0000-0000-000000000003");
    static final UUID CONSUMIDOR2=UUID.fromString("00000000-0000-0000-0000-000000000004");
    static final UUID ALFACE=UUID.fromString("00000000-0000-0000-0000-000000000010");
    static final UUID TOMATE=UUID.fromString("00000000-0000-0000-0000-000000000011");
    static String sql;

    @BeforeAll static void prepararSchema() throws Exception {
        try (var c=pg.getPostgresDatabase().getConnection(); var s=c.createStatement()) {
            // Somente o PostgreSQL descartável de testes recebe estas tabelas/roles fictícias.
            s.execute("create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated;");
            sql=Files.readString(Path.of("../supabase/001_estrutura.sql"));
            s.execute(sql);
        }
    }
    @BeforeEach void preparar() {
        jdbc.execute("truncate auth.users cascade");
        usuario(PRODUTOR,"produtor"); usuario(PRODUTOR2,"produtor");
        usuario(CONSUMIDOR,"consumidor"); usuario(CONSUMIDOR2,"consumidor");
        produto(ALFACE,PRODUTOR,5,"3.50"); produto(TOMATE,PRODUTOR2,10,"7.00");
        when(auth.usuario(anyString())).thenAnswer(invocacao -> {
            String token=invocacao.getArgument(0);
            UUID id=switch(token) {
                case "produtor" -> PRODUTOR; case "produtor2" -> PRODUTOR2;
                case "consumidor" -> CONSUMIDOR; case "consumidor2" -> CONSUMIDOR2;
                default -> throw new ApiException(HttpStatus.UNAUTHORIZED,"Token inválido.");
            };
            return Map.of("id",id.toString(),"email",id+"@teste.com");
        });
    }
    void usuario(UUID id,String tipo) {
        jdbc.update("insert into auth.users(id) values (?)",id);
        jdbc.update("insert into agroconnect.usuarios(id,nome,email,tipo_usuario,cidade,endereco_entrega) values (?,?,?,?,?,?)",
            id,"Pessoa Teste",id+"@teste.com",tipo,"Curitiba","Rua Teste 100");
    }
    void produto(UUID id,UUID produtor,int estoque,String preco) {
        jdbc.update("insert into agroconnect.produtos(id,produtor_id,nome,preco,categoria,quantidade_estoque) values (?,?,?,?,?,?)",id,produtor,"Produto Teste",new BigDecimal(preco),"Verduras",estoque);
    }
    ResponseEntity<Object> chamar(String token,HttpMethod method,String path,Object body) {
        try {
            var requisicao=java.net.http.HttpRequest.newBuilder(java.net.URI.create("http://127.0.0.1:"+porta+path))
                .timeout(java.time.Duration.ofSeconds(20)).header("Content-Type","application/json");
            if (token!=null) requisicao.header("Authorization","Bearer "+token);
            requisicao.method(method.name(),body==null ? java.net.http.HttpRequest.BodyPublishers.noBody() :
                java.net.http.HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
            var resposta=java.net.http.HttpClient.newHttpClient().send(requisicao.build(),java.net.http.HttpResponse.BodyHandlers.ofString());
            return ResponseEntity.status(resposta.statusCode()).body(json.readValue(resposta.body(),Object.class));
        } catch (Exception erro) { throw new IllegalStateException("Falha na chamada HTTP do teste",erro); }
    }
    Map<String,Object> checkout(String chave,UUID produto,int quantidade) {
        return Map.of("chave",chave,"itens",List.of(Map.of("produtoId",produto,"quantidade",quantidade)));
    }
    @SuppressWarnings("unchecked") List<Map<String,Object>> pedidos(ResponseEntity<Object> resposta) {
        assertThat(resposta.getStatusCode().value()).as(String.valueOf(resposta.getBody())).isEqualTo(200);
        return (List<Map<String,Object>>)resposta.getBody();
    }
    int estoque(UUID id) { return jdbc.queryForObject("select quantidade_estoque from agroconnect.produtos where id=?",Integer.class,id); }
    long quantidade(String tabela) { return jdbc.queryForObject("select count(*) from agroconnect."+tabela,Long.class); }
    ResponseEntity<Object> status(String token,String id,String status) { return chamar(token,HttpMethod.PATCH,"/api/pedidos/"+id+"/status",Map.of("status",status)); }

    @Test void exigeAutenticacaoEPerfilCorretoParaCadastrarProduto() {
        assertThat(chamar(null,HttpMethod.GET,"/api/produtos",null).getStatusCode().value()).isEqualTo(401);
        var dados=Map.of("nome","Couve","preco",5,"categoria","Verduras","quantidadeEstoque",2);
        assertThat(chamar("consumidor",HttpMethod.POST,"/api/produtos",dados).getStatusCode().value()).isEqualTo(403);
        assertThat(chamar("produtor",HttpMethod.POST,"/api/produtos",dados).getStatusCode().value()).isEqualTo(200);
        assertThat(chamar("produtor2",HttpMethod.PUT,"/api/produtos/"+ALFACE,dados).getStatusCode().value()).isEqualTo(404);
    }
    @Test void validaDadosNoServidorMesmoSeAplicativoForAlterado() {
        var dados=Map.of("nome","Couve","preco",-1,"categoria","Verduras","quantidadeEstoque",2);
        assertThat(chamar("produtor",HttpMethod.POST,"/api/produtos",dados).getStatusCode().value()).isEqualTo(400);
        var adulterado=new HashMap<>(checkout("fraude",ALFACE,1)); adulterado.put("valorTotal",0.01);
        assertThat(chamar("consumidor",HttpMethod.POST,"/api/pedidos",adulterado).getStatusCode().value()).isEqualTo(400);
        assertThat(estoque(ALFACE)).isEqualTo(5);
    }
    @Test void separaProdutoresECalculaTotalComPrecosDoBanco() {
        var resposta=chamar("consumidor",HttpMethod.POST,"/api/pedidos",Map.of("chave","misto","itens",List.of(
            Map.of("produtoId",ALFACE,"quantidade",2),Map.of("produtoId",TOMATE,"quantidade",3))));
        var lista=pedidos(resposta); assertThat(lista).hasSize(2);
        double total=lista.stream().mapToDouble(p->((Number)p.get("valorTotal")).doubleValue()).sum();
        assertThat(total).isEqualTo(28.0); assertThat(estoque(ALFACE)).isEqualTo(3); assertThat(estoque(TOMATE)).isEqualTo(7);
    }
    @Test void faltaDeEstoqueDesfazTodoCheckout() {
        var resposta=chamar("consumidor",HttpMethod.POST,"/api/pedidos",Map.of("chave","sem-estoque","itens",List.of(
            Map.of("produtoId",ALFACE,"quantidade",1),Map.of("produtoId",TOMATE,"quantidade",99))));
        assertThat(resposta.getStatusCode().value()).isEqualTo(409);
        assertThat(estoque(ALFACE)).isEqualTo(5); assertThat(quantidade("pedidos")).isZero(); assertThat(quantidade("checkouts")).isZero();
    }
    @Test void repeticaoDaSolicitacaoNaoDuplicaPedidoNemBaixaEstoqueDuasVezes() {
        var corpo=checkout("repetido",ALFACE,2);
        var primeiro=pedidos(chamar("consumidor",HttpMethod.POST,"/api/pedidos",corpo));
        var segundo=pedidos(chamar("consumidor",HttpMethod.POST,"/api/pedidos",corpo));
        assertThat(primeiro.get(0).get("id")).isEqualTo(segundo.get(0).get("id"));
        assertThat(estoque(ALFACE)).isEqualTo(3); assertThat(quantidade("pedidos")).isEqualTo(1);
        assertThat(chamar("consumidor",HttpMethod.POST,"/api/pedidos",checkout("repetido",ALFACE,1)).getStatusCode().value()).isEqualTo(409);
    }
    @Test void cancelamentoDevolveEstoqueSomenteUmaVezEIsolaAsContas() {
        String id=pedidos(chamar("consumidor",HttpMethod.POST,"/api/pedidos",checkout("cancelar",ALFACE,2))).get(0).get("id").toString();
        assertThat(status("produtor2",id,"confirmado").getStatusCode().value()).isEqualTo(404);
        assertThat(status("consumidor2",id,"cancelado").getStatusCode().value()).isEqualTo(404);
        assertThat(status("consumidor",id,"confirmado").getStatusCode().value()).isEqualTo(403);
        assertThat(status("consumidor",id,"cancelado").getStatusCode().value()).isEqualTo(200);
        assertThat(status("consumidor",id,"cancelado").getStatusCode().value()).isEqualTo(200);
        assertThat(estoque(ALFACE)).isEqualTo(5);
    }
    @Test void avaliacaoExigeEntregaEDonoDoPedidoENaoAceitaDuplicacao() {
        String id=pedidos(chamar("consumidor",HttpMethod.POST,"/api/pedidos",checkout("avaliar",ALFACE,1))).get(0).get("id").toString();
        var avaliacao=Map.of("pedidoId",id,"nota",5,"comentario","Ótimo produto");
        assertThat(chamar("consumidor",HttpMethod.POST,"/api/avaliacoes",avaliacao).getStatusCode().value()).isEqualTo(409);
        assertThat(status("produtor",id,"entregue").getStatusCode().value()).isEqualTo(409);
        for (String estado:List.of("confirmado","em_rota","entregue")) assertThat(status("produtor",id,estado).getStatusCode().value()).isEqualTo(200);
        assertThat(chamar("consumidor2",HttpMethod.POST,"/api/avaliacoes",avaliacao).getStatusCode().value()).isEqualTo(404);
        assertThat(chamar("consumidor",HttpMethod.POST,"/api/avaliacoes",avaliacao).getStatusCode().value()).isEqualTo(200);
        assertThat(chamar("consumidor",HttpMethod.POST,"/api/avaliacoes",avaliacao).getStatusCode().value()).isEqualTo(409);
    }
    @Test void doisConsumidoresDisputandoUltimaUnidadeNaoGeramEstoqueNegativo() throws Exception {
        jdbc.update("update agroconnect.produtos set quantidade_estoque=1 where id=?",ALFACE);
        var inicio=new CountDownLatch(1); var executor=Executors.newFixedThreadPool(2);
        try {
            var a=executor.submit(()->{ inicio.await(); return chamar("consumidor",HttpMethod.POST,"/api/pedidos",checkout("a",ALFACE,1)).getStatusCode().value(); });
            var b=executor.submit(()->{ inicio.await(); return chamar("consumidor2",HttpMethod.POST,"/api/pedidos",checkout("b",ALFACE,1)).getStatusCode().value(); });
            inicio.countDown(); assertThat(List.of(a.get(30,TimeUnit.SECONDS),b.get(30,TimeUnit.SECONDS))).containsExactlyInAnyOrder(200,409);
            assertThat(estoque(ALFACE)).isZero(); assertThat(quantidade("pedidos")).isEqualTo(1);
        } finally { executor.shutdownNow(); }
    }
    @Test void sqlPodeSerExecutadoNovamenteSemApagarCadastros() {
        jdbc.execute(sql); assertThat(quantidade("usuarios")).isEqualTo(4); assertThat(quantidade("produtos")).isEqualTo(2);
    }
    @AfterAll static void encerrar() throws IOException { pg.close(); }
}
