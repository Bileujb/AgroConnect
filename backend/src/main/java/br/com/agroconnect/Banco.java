package br.com.agroconnect;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class Banco {
    final JdbcTemplate jdbc;
    public Banco(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    // O SQL usa snake_case. O app recebe camelCase, como já usava nas telas.
    static Map<String,Object> adaptar(Map<String,Object> linha) {
        Map<String,Object> dados = new LinkedHashMap<>();
        linha.forEach((chave, valor) -> {
            StringBuilder nome = new StringBuilder(); boolean maiuscula = false;
            for (char letra : chave.toCharArray()) {
                if (letra == '_') { maiuscula = true; continue; }
                nome.append(maiuscula ? Character.toUpperCase(letra) : letra); maiuscula = false;
            }
            dados.put(nome.toString(), valor instanceof UUID ? valor.toString() : valor);
        });
        return dados;
    }
    List<Map<String,Object>> listar(String sql, Object... parametros) {
        return jdbc.queryForList(sql, parametros).stream().map(Banco::adaptar).toList();
    }
    Map<String,Object> um(String sql, Object... parametros) {
        var linhas = listar(sql, parametros);
        if (linhas.isEmpty()) throw ApiException.naoEncontrado();
        return linhas.get(0);
    }
    static UUID id(Map<String,Object> usuario) { return UUID.fromString(usuario.get("id").toString()); }
    static void exigirTipo(Map<String,Object> usuario, String tipo) {
        if (!tipo.equals(usuario.get("tipoUsuario"))) throw ApiException.proibido();
    }
}
