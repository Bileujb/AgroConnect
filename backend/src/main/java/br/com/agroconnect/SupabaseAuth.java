package br.com.agroconnect;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;

@Service
public class SupabaseAuth {
    private final RestClient http;
    private final String chave;
    private final String baseUrl;
    public SupabaseAuth(@Value("${supabase.url}") String url, @Value("${supabase.key}") String chave) {
        this.chave = chave;
        this.baseUrl = url.replaceAll("/$", "") + "/auth/v1";
        var fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(8000); fabrica.setReadTimeout(15000);
        this.http = RestClient.builder().baseUrl(url.replaceAll("/$", "") + "/auth/v1")
            .requestFactory(fabrica).build();
    }
    Map<String,Object> chamar(HttpMethod metodo, String caminho, Map<String,?> corpo, String token) {
        if (chave.isBlank()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Configure a chave pública do Supabase no backend.");
        try {
            var requisicao = http.method(metodo).uri(java.net.URI.create(baseUrl + caminho)).header("apikey", chave)
                .accept(MediaType.APPLICATION_JSON);
            if (token != null) requisicao.header("Authorization", "Bearer " + token);
            if (corpo != null) requisicao.contentType(MediaType.APPLICATION_JSON).body(corpo);
            var resposta = requisicao.retrieve().body(new ParameterizedTypeReference<Map<String,Object>>() {});
            return resposta == null ? new HashMap<>() : resposta;
        } catch (RestClientResponseException erro) {
            String mensagem = "Não foi possível autenticar. Confira os dados informados.";
            int codigo = erro.getStatusCode().value();
            if (codigo == 429) throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Muitas solicitações. Aguarde antes de tentar novamente.");
            if (erro.getResponseBodyAsString().contains("email_not_confirmed")) {
                throw ApiException.invalido("Confirme seu e-mail antes de entrar.");
            }
            if (erro.getResponseBodyAsString().contains("user_already_exists")) mensagem = "Este e-mail já está cadastrado.";
            if (erro.getResponseBodyAsString().contains("weak_password")) mensagem = "A senha não atende às regras configuradas no Supabase.";
            if (codigo >= 500) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "O serviço de autenticação está indisponível.");
            boolean semSessao = codigo == 401 || codigo == 403 || caminho.contains("grant_type=password");
            throw new ApiException(semSessao ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST, mensagem);
        } catch (RestClientException erro) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível conectar ao Supabase. Confira a conexão e a configuração da API.");
        }
    }
    public Map<String,Object> usuario(String token) {
        return chamar(HttpMethod.GET, "/user", null, token);
    }
    public static String token(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.substring(7).isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Entre na sua conta para continuar.");
        }
        return authorization.substring(7);
    }
}
