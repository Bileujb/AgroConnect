package br.com.agroconnect;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    final AutenticacaoInterceptor autenticacao; final String[] origens;
    public WebConfig(AutenticacaoInterceptor autenticacao,@Value("${app.cors-origins}") String origens) {
        this.autenticacao=autenticacao; this.origens=origens.split(",");
    }
    @Override public void addInterceptors(InterceptorRegistry registro) {
        registro.addInterceptor(autenticacao).addPathPatterns("/api/**").excludePathPatterns("/api/saude");
    }
    @Override public void addCorsMappings(CorsRegistry registro) {
        registro.addMapping("/**").allowedOrigins(origens).allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS")
            .allowedHeaders("Authorization","Content-Type");
    }
}
