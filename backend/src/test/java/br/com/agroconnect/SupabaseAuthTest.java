package br.com.agroconnect;

import static org.assertj.core.api.Assertions.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;
import org.springframework.http.HttpMethod;

class SupabaseAuthTest {
    HttpServer servidor; SupabaseAuth auth;
    @BeforeEach void iniciar() throws Exception {
        servidor=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0); servidor.start();
        auth=new SupabaseAuth("http://127.0.0.1:"+servidor.getAddress().getPort(),"chave-de-teste");
    }
    @AfterEach void parar() { servidor.stop(0); }
    @Test void validaTokenNoServidorAuthEmVezDeApenasDecodificarJwt() {
        var cabecalho=new AtomicReference<String>();
        servidor.createContext("/auth/v1/user",e->{
            cabecalho.set(e.getRequestHeaders().getFirst("Authorization"));
            byte[] body="{\"id\":\"usuario-confirmado\"}".getBytes(StandardCharsets.UTF_8);
            e.getResponseHeaders().set("Content-Type","application/json");e.sendResponseHeaders(200,body.length);e.getResponseBody().write(body);e.close();
        });
        assertThat(auth.usuario("token-assinado").get("id")).isEqualTo("usuario-confirmado");
        assertThat(cabecalho.get()).isEqualTo("Bearer token-assinado");
    }
    @Test void tokenRecusadoPeloSupabaseVira401() {
        servidor.createContext("/auth/v1/user",e->{e.sendResponseHeaders(401,-1);e.close();});
        assertThatThrownBy(()->auth.usuario("invalido")).isInstanceOfSatisfying(ApiException.class,e->assertThat(e.status.value()).isEqualTo(401));
    }
    @Test void enderecoDeRecuperacaoNaoRecebeCodificacaoDuplicada() {
        var query=new AtomicReference<String>();
        servidor.createContext("/auth/v1/recover",e->{query.set(e.getRequestURI().getRawQuery());e.getResponseHeaders().set("Content-Type","application/json");e.sendResponseHeaders(200,2);e.getResponseBody().write("{}".getBytes());e.close();});
        String redirect="http://localhost:8080/recuperar-senha.html";
        auth.chamar(HttpMethod.POST,"/recover?redirect_to="+URLEncoder.encode(redirect,StandardCharsets.UTF_8),Map.of("email","teste@teste.com"),null);
        assertThat(query.get()).contains("http%3A%2F%2Flocalhost").doesNotContain("%253A");
    }
    @Test void senhaFracaNaoDeveInvalidarUmaSessaoAutenticada() {
        servidor.createContext("/auth/v1/user",e->{
            byte[] body="{\"code\":\"weak_password\"}".getBytes(StandardCharsets.UTF_8);
            e.sendResponseHeaders(400,body.length);e.getResponseBody().write(body);e.close();
        });
        assertThatThrownBy(()->auth.chamar(HttpMethod.PUT,"/user",Map.of("password","fraca"),"token-valido"))
            .isInstanceOfSatisfying(ApiException.class,e->assertThat(e.status.value()).isEqualTo(400));
    }
}
