package br.com.agroconnect;

import java.util.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {
    final Banco banco; final PerfilService perfis; final ProdutoService produtos;
    final PedidoService pedidos; final AvaliacaoService avaliacoes;
    final SupabaseAuth auth; final AuthController sessoes;
    public ApiController(Banco banco, PerfilService perfis, ProdutoService produtos, PedidoService pedidos,
        AvaliacaoService avaliacoes, SupabaseAuth auth, AuthController sessoes) {
        this.banco=banco; this.perfis=perfis; this.produtos=produtos; this.pedidos=pedidos;
        this.avaliacoes=avaliacoes; this.auth=auth; this.sessoes=sessoes;
    }
    @GetMapping("/saude") Map<String,String> saude() {
        banco.jdbc.queryForObject("select count(*) from agroconnect.usuarios",Long.class);
        return Map.of("status","ok","banco","conectado");
    }
    @GetMapping("/perfil") Map<String,Object> perfil(@RequestAttribute("usuario") Map<String,Object> usuario) { return usuario; }
    @PutMapping("/perfil") Map<String,Object> salvarPerfil(@RequestAttribute("usuario") Map<String,Object> usuario, @Valid @RequestBody Dados.Perfil dados) {
        return perfis.atualizar(usuario,dados);
    }
    @PostMapping("/perfil/senha") Map<String,Object> trocarSenha(@RequestAttribute("usuario") Map<String,Object> usuario, @Valid @RequestBody Dados.TrocarSenha dados) {
        if (dados.senhaAtual().equals(dados.novaSenha())) throw ApiException.invalido("Escolha uma senha diferente da atual.");
        Map<String,Object> verificacao;
        try {
            verificacao=auth.chamar(HttpMethod.POST,"/token?grant_type=password",Map.of("email",usuario.get("email"),"password",dados.senhaAtual()),null);
        } catch (ApiException erro) {
            if (erro.status == org.springframework.http.HttpStatus.UNAUTHORIZED) throw ApiException.invalido("A senha atual está incorreta.");
            throw erro;
        }
        String token=verificacao.get("access_token").toString();
        if (!usuario.get("id").equals(auth.usuario(token).get("id"))) throw ApiException.proibido();
        auth.chamar(HttpMethod.PUT,"/user",Map.of("password",dados.novaSenha()),token);
        return sessoes.sessao(verificacao);
    }
    @GetMapping("/produtos") List<Map<String,Object>> listarProdutos(@RequestAttribute("usuario") Map<String,Object> usuario, @RequestParam(defaultValue="false") boolean meus) {
        return produtos.listar(usuario,meus);
    }
    @GetMapping("/produtos/{id}") Map<String,Object> produto(@PathVariable UUID id) { return produtos.obter(id); }
    @PostMapping("/produtos") Map<String,Object> cadastrarProduto(@RequestAttribute("usuario") Map<String,Object> usuario, @Valid @RequestBody Dados.Produto dados) {
        return produtos.cadastrar(usuario,dados);
    }
    @PutMapping("/produtos/{id}") Map<String,Object> editarProduto(@RequestAttribute("usuario") Map<String,Object> usuario, @PathVariable UUID id, @Valid @RequestBody Dados.Produto dados) {
        return produtos.atualizar(usuario,id,dados);
    }
    @DeleteMapping("/produtos/{id}") Map<String,String> removerProduto(@RequestAttribute("usuario") Map<String,Object> usuario,@PathVariable UUID id) {
        produtos.remover(usuario,id); return Map.of("mensagem","Produto removido do catálogo.");
    }
    @GetMapping("/pedidos") List<Map<String,Object>> listarPedidos(@RequestAttribute("usuario") Map<String,Object> usuario) { return pedidos.listar(usuario); }
    @PostMapping("/pedidos") List<Map<String,Object>> criarPedido(@RequestAttribute("usuario") Map<String,Object> usuario,@Valid @RequestBody Dados.Checkout dados) {
        return pedidos.criar(usuario,dados);
    }
    @PatchMapping("/pedidos/{id}/status") Map<String,Object> status(@RequestAttribute("usuario") Map<String,Object> usuario,@PathVariable UUID id,@Valid @RequestBody Dados.Status dados) {
        return pedidos.atualizarStatus(usuario,id,dados.status());
    }
    @GetMapping("/avaliacoes") List<Map<String,Object>> listarAvaliacoes(@RequestAttribute("usuario") Map<String,Object> usuario) { return avaliacoes.listar(usuario); }
    @PostMapping("/avaliacoes") Map<String,Object> avaliar(@RequestAttribute("usuario") Map<String,Object> usuario,@Valid @RequestBody Dados.Avaliacao dados) {
        return avaliacoes.criar(usuario,dados);
    }
}
