package br.com.agroconnect;

import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class PerfilService {
    final Banco banco;
    public PerfilService(Banco banco) { this.banco = banco; }
    static String texto(Map<String,?> dados, String campo) {
        Object valor = dados.get(campo); return valor instanceof String ? valor.toString().trim() : "";
    }
    static String seguro(String valor) { return valor == null ? "" : valor.trim(); }
    static void validarEndereco(String tipo, String fazenda, String cnpj, String enderecoFazenda, String enderecoEntrega) {
        if (tipo.equals("produtor")) {
            if (seguro(fazenda).isBlank() || seguro(enderecoFazenda).isBlank() || !seguro(cnpj).replaceAll("\\D", "").matches("[0-9]{14}")) {
                throw ApiException.invalido("Preencha nome da fazenda, CNPJ com 14 números e endereço da fazenda.");
            }
        } else if (seguro(enderecoEntrega).isBlank()) throw ApiException.invalido("Informe o endereço de entrega.");
    }
    @SuppressWarnings("unchecked")
    public Map<String,Object> obterOuCriar(Map<String,Object> auth) {
        UUID id = UUID.fromString(auth.get("id").toString());
        String email = texto(auth, "email");
        var existentes = banco.listar("select * from agroconnect.usuarios where id = ?", id);
        if (existentes.isEmpty()) {
            Map<String,Object> meta = auth.get("user_metadata") instanceof Map ? (Map<String,Object>) auth.get("user_metadata") : Map.of();
            // São perfis públicos do marketplace, nunca papéis administrativos.
            String tipo = "produtor".equals(meta.get("tipoUsuario")) ? "produtor" : "consumidor";
            String nome = texto(meta, "nome");
            if (nome.isBlank()) nome = email.contains("@") ? email.substring(0, email.indexOf('@')) : "Minha conta";
            banco.jdbc.update("""
                insert into agroconnect.usuarios (id,nome,email,tipo_usuario,cidade,nome_fazenda,cnpj,endereco_fazenda,endereco_entrega)
                values (?,?,?,?,?,?,?,?,?) on conflict (id) do nothing
                """, id, nome, email, tipo, texto(meta,"cidade"), texto(meta,"nomeFazenda"),
                texto(meta,"cnpj"), texto(meta,"enderecoFazenda"), texto(meta,"enderecoEntrega"));
        }
        // O e-mail vem do Auth validado, não de um campo editável do aplicativo.
        banco.jdbc.update("update agroconnect.usuarios set email=? where id=? and email<>?", email, id, email);
        return banco.um("select * from agroconnect.usuarios where id=?", id);
    }
    public Map<String,Object> atualizar(Map<String,Object> usuario, Dados.Perfil dados) {
        validarEndereco(usuario.get("tipoUsuario").toString(), dados.nomeFazenda(), dados.cnpj(), dados.enderecoFazenda(), dados.enderecoEntrega());
        banco.jdbc.update("""
            update agroconnect.usuarios set nome=?,cidade=?,nome_fazenda=?,cnpj=?,endereco_fazenda=?,endereco_entrega=? where id=?
            """, dados.nome().trim(), dados.cidade().trim(), seguro(dados.nomeFazenda()), seguro(dados.cnpj()).replaceAll("\\D", ""),
            seguro(dados.enderecoFazenda()), seguro(dados.enderecoEntrega()), Banco.id(usuario));
        return banco.um("select * from agroconnect.usuarios where id=?", Banco.id(usuario));
    }
}
