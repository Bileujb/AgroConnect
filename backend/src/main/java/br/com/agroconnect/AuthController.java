package br.com.agroconnect;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    final SupabaseAuth auth;
    final PerfilService perfis;
    final String redirect;
    public AuthController(SupabaseAuth auth, PerfilService perfis, @Value("${app.auth-redirect-url}") String redirect) {
        this.auth=auth; this.perfis=perfis; this.redirect=redirect;
    }
    Map<String,Object> sessao(Map<String,Object> resposta) {
        if (!resposta.containsKey("access_token")) return Map.of("confirmarEmail", true,
            "mensagem", "Solicitação recebida. Confira seu e-mail para confirmar o cadastro e depois entre na conta.");
        String token = resposta.get("access_token").toString();
        var usuario = perfis.obterOuCriar(auth.usuario(token));
        long segundos = resposta.get("expires_in") instanceof Number n ? n.longValue() : 3600;
        return Map.of("accessToken", token, "refreshToken", resposta.get("refresh_token"),
            "expiresAt", Instant.now().getEpochSecond()+segundos, "usuario", usuario);
    }
    @PostMapping("/login")
    Map<String,Object> entrar(@Valid @RequestBody Dados.Login dados) {
        return sessao(auth.chamar(HttpMethod.POST, "/token?grant_type=password", Map.of("email",dados.email().trim(),"password",dados.senha()),null));
    }
    @PostMapping("/cadastro")
    Map<String,Object> cadastrar(@Valid @RequestBody Dados.Cadastro dados) {
        PerfilService.validarEndereco(dados.tipoUsuario(),dados.nomeFazenda(),dados.cnpj(),dados.enderecoFazenda(),dados.enderecoEntrega());
        Map<String,Object> meta=new LinkedHashMap<>();
        meta.put("nome",dados.nome().trim()); meta.put("tipoUsuario",dados.tipoUsuario()); meta.put("cidade",dados.cidade().trim());
        meta.put("nomeFazenda",PerfilService.seguro(dados.nomeFazenda())); meta.put("cnpj",PerfilService.seguro(dados.cnpj()).replaceAll("\\D", ""));
        meta.put("enderecoFazenda",PerfilService.seguro(dados.enderecoFazenda())); meta.put("enderecoEntrega",PerfilService.seguro(dados.enderecoEntrega()));
        return sessao(auth.chamar(HttpMethod.POST,"/signup", Map.of("email",dados.email().trim(),"password",dados.senha(),"data",meta),null));
    }
    @PostMapping("/renovar")
    Map<String,Object> renovar(@Valid @RequestBody Dados.Renovar dados) {
        return sessao(auth.chamar(HttpMethod.POST,"/token?grant_type=refresh_token",Map.of("refresh_token",dados.refreshToken()),null));
    }
    @PostMapping("/recuperar")
    Map<String,String> recuperar(@Valid @RequestBody Dados.EmailRecuperacao dados) {
        auth.chamar(HttpMethod.POST,"/recover?redirect_to="+URLEncoder.encode(redirect,StandardCharsets.UTF_8), Map.of("email",dados.email().trim()),null);
        return Map.of("mensagem","Solicitação processada. Se houver uma conta para esse e-mail, verifique a caixa de entrada e o spam.");
    }
    @PostMapping("/nova-senha")
    Map<String,String> novaSenha(@RequestHeader(value="Authorization",required=false) String authorization, @Valid @RequestBody Dados.NovaSenha dados) {
        String token=SupabaseAuth.token(authorization); auth.usuario(token);
        auth.chamar(HttpMethod.PUT,"/user",Map.of("password",dados.senha()),token);
        return Map.of("mensagem","Senha atualizada. Volte ao AgroConnect e entre com a nova senha.");
    }
    @PostMapping("/sair")
    Map<String,String> sair(@RequestHeader(value="Authorization",required=false) String authorization) {
        auth.chamar(HttpMethod.POST,"/logout?scope=local",null,SupabaseAuth.token(authorization));
        return Map.of("mensagem","Sessão encerrada.");
    }
}
