package br.com.agroconnect;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {
    final Banco banco;
    public PedidoService(Banco banco) { this.banco=banco; }
    List<Map<String,Object>> comItens(List<Map<String,Object>> pedidos) {
        for (var pedido:pedidos) {
            pedido.put("itens",banco.listar("select * from agroconnect.itens_pedido where pedido_id=? order by nome",UUID.fromString(pedido.get("id").toString())));
        }
        return pedidos;
    }
    public List<Map<String,Object>> listar(Map<String,Object> usuario) {
        String campo="produtor".equals(usuario.get("tipoUsuario")) ? "produtor_id" : "consumidor_id";
        return comItens(banco.listar("""
            select p.*,c.nome as nome_consumidor,u.nome as nome_produtor
            from agroconnect.pedidos p join agroconnect.usuarios c on c.id=p.consumidor_id
            join agroconnect.usuarios u on u.id=p.produtor_id
            """+" where p."+campo+"=? order by p.created_at desc limit 500",Banco.id(usuario)));
    }
    static SortedMap<UUID,Integer> agrupar(List<Dados.Item> itens) {
        var quantidades=new TreeMap<UUID,Integer>();
        for (var item:itens) {
            if (item.produtoId()==null || item.quantidade()<1 || item.quantidade()>10000) throw ApiException.invalido("Quantidade inválida.");
            int quantidade=quantidades.getOrDefault(item.produtoId(),0)+item.quantidade();
            if (quantidade>10000) throw ApiException.invalido("Quantidade máxima excedida.");
            quantidades.put(item.produtoId(),quantidade);
        }
        if (quantidades.isEmpty()) throw ApiException.invalido("O carrinho está vazio.");
        return quantidades;
    }
    static String assinatura(SortedMap<UUID,Integer> quantidades) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(quantidades.toString().getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException erro) { throw new IllegalStateException(erro); }
    }
    @Transactional
    public List<Map<String,Object>> criar(Map<String,Object> usuario, Dados.Checkout dados) {
        Banco.exigirTipo(usuario,"consumidor");
        if (usuario.get("enderecoEntrega")==null || usuario.get("enderecoEntrega").toString().isBlank() || usuario.get("cidade").toString().isBlank()) {
            throw ApiException.invalido("Complete seu endereço e sua cidade em Meu Perfil antes de pedir.");
        }
        var quantidades=agrupar(dados.itens());
        String assinatura=assinatura(quantidades);
        UUID checkout=UUID.randomUUID();
        int inseridos=banco.jdbc.update("""
            insert into agroconnect.checkouts (id,consumidor_id,chave,assinatura) values (?,?,?,?)
            on conflict (consumidor_id,chave) do nothing
            """,checkout,Banco.id(usuario),dados.chave(),assinatura);
        if (inseridos==0) {
            var anterior=banco.um("select * from agroconnect.checkouts where consumidor_id=? and chave=?",Banco.id(usuario),dados.chave());
            if (!assinatura.equals(anterior.get("assinatura"))) throw ApiException.conflito("Esta solicitação já foi usada para outro carrinho.");
            return comItens(banco.listar("select * from agroconnect.pedidos where checkout_id=? order by produtor_id",UUID.fromString(anterior.get("id").toString())));
        }
        Map<UUID,List<Map<String,Object>>> grupos=new LinkedHashMap<>();
        Map<UUID,BigDecimal> totais=new LinkedHashMap<>();
        // A ordem fixa de locks evita que dois carrinhos travem um ao outro.
        for (var item:quantidades.entrySet()) {
            var produto=banco.um("select * from agroconnect.produtos where id=? and ativo=true for update",item.getKey());
            int estoque=((Number)produto.get("quantidadeEstoque")).intValue();
            if (estoque<item.getValue()) throw ApiException.conflito("Estoque insuficiente para "+produto.get("nome")+". Atualize o catálogo.");
            UUID produtor=UUID.fromString(produto.get("produtorId").toString());
            produto.put("quantidade",item.getValue());
            grupos.computeIfAbsent(produtor,k->new ArrayList<>()).add(produto);
            var subtotal=((BigDecimal)produto.get("preco")).multiply(BigDecimal.valueOf(item.getValue()));
            totais.merge(produtor,subtotal,BigDecimal::add);
            banco.jdbc.update("update agroconnect.produtos set quantidade_estoque=quantidade_estoque-? where id=?",item.getValue(),item.getKey());
        }
        for (var grupo:grupos.entrySet()) {
            UUID pedido=UUID.randomUUID();
            if (totais.get(grupo.getKey()).compareTo(new BigDecimal("9999999999.99"))>0) throw ApiException.invalido("Valor máximo do pedido excedido.");
            banco.jdbc.update("""
                insert into agroconnect.pedidos (id,checkout_id,consumidor_id,produtor_id,valor_total,endereco_entrega,cidade_entrega)
                values (?,?,?,?,?,?,?)
                """,pedido,checkout,Banco.id(usuario),grupo.getKey(),totais.get(grupo.getKey()),usuario.get("enderecoEntrega"),usuario.get("cidade"));
            for (var item:grupo.getValue()) {
                banco.jdbc.update("""
                    insert into agroconnect.itens_pedido (id,pedido_id,produto_id,nome,quantidade,preco_unitario) values (?,?,?,?,?,?)
                    """,UUID.randomUUID(),pedido,UUID.fromString(item.get("id").toString()),item.get("nome"),item.get("quantidade"),item.get("preco"));
            }
        }
        // Tudo acontece em uma transação: falha em qualquer item desfaz o carrinho inteiro.
        return comItens(banco.listar("select * from agroconnect.pedidos where checkout_id=? order by produtor_id",checkout));
    }
    @Transactional
    public Map<String,Object> atualizarStatus(Map<String,Object> usuario, UUID id, String novo) {
        var pedido=banco.um("select * from agroconnect.pedidos where id=? for update",id);
        boolean produtor=usuario.get("id").equals(pedido.get("produtorId"));
        boolean consumidor=usuario.get("id").equals(pedido.get("consumidorId"));
        if (!produtor && !consumidor) throw ApiException.naoEncontrado();
        String atual=pedido.get("status").toString();
        if (!produtor && !novo.equals("cancelado")) throw ApiException.proibido();
        if (atual.equals(novo)) return comItens(new ArrayList<>(List.of(pedido))).get(0);
        if (!produtor && !atual.equals("aguardando")) throw ApiException.proibido();
        boolean permitido=novo.equals("cancelado") ? atual.equals("aguardando") || atual.equals("confirmado") :
            (atual.equals("aguardando") && novo.equals("confirmado")) ||
            (atual.equals("confirmado") && novo.equals("em_rota")) ||
            (atual.equals("em_rota") && novo.equals("entregue"));
        if (!permitido) throw ApiException.conflito("Esta mudança de status não é permitida.");
        if (novo.equals("cancelado")) {
            var itens=banco.listar("select * from agroconnect.itens_pedido where pedido_id=? order by produto_id",id);
            for (var item:itens) banco.jdbc.update("update agroconnect.produtos set quantidade_estoque=quantidade_estoque+? where id=?",item.get("quantidade"),UUID.fromString(item.get("produtoId").toString()));
        }
        banco.jdbc.update("update agroconnect.pedidos set status=? where id=?",novo,id);
        pedido.put("status",novo);
        return comItens(new ArrayList<>(List.of(pedido))).get(0);
    }
}
