package br.com.agroconnect;

import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {
    final SupabaseAuth auth; final PerfilService perfis;
    public AutenticacaoInterceptor(SupabaseAuth auth, PerfilService perfis) { this.auth=auth; this.perfis=perfis; }
    @Override public boolean preHandle(HttpServletRequest pedido, HttpServletResponse resposta, Object handler) {
        if (pedido.getMethod().equals("OPTIONS")) return true;
        String token=SupabaseAuth.token(pedido.getHeader("Authorization"));
        pedido.setAttribute("usuario",perfis.obterOuCriar(auth.usuario(token)));
        resposta.setHeader("Cache-Control","no-store");
        return true;
    }
}
