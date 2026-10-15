package br.com.agroconnect;

import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AvaliacaoService {
    final Banco banco;
    public AvaliacaoService(Banco banco) { this.banco=banco; }
    public List<Map<String,Object>> listar(Map<String,Object> usuario) {
        String campo="produtor".equals(usuario.get("tipoUsuario")) ? "produtor_id" : "consumidor_id";
        return banco.listar("select * from agroconnect.avaliacoes where "+campo+"=? order by created_at desc limit 500",Banco.id(usuario));
    }
    @Transactional
    public Map<String,Object> criar(Map<String,Object> usuario, Dados.Avaliacao dados) {
        Banco.exigirTipo(usuario,"consumidor");
        var pedido=banco.um("select * from agroconnect.pedidos where id=? for update",dados.pedidoId());
        if (!usuario.get("id").equals(pedido.get("consumidorId"))) throw ApiException.naoEncontrado();
        if (!"entregue".equals(pedido.get("status"))) throw ApiException.conflito("A avaliação fica disponível após a entrega.");
        if (!banco.listar("select id from agroconnect.avaliacoes where pedido_id=?",dados.pedidoId()).isEmpty()) throw ApiException.conflito("Este pedido já foi avaliado.");
        UUID id=UUID.randomUUID();
        banco.jdbc.update("""
            insert into agroconnect.avaliacoes (id,pedido_id,consumidor_id,produtor_id,nota,comentario) values (?,?,?,?,?,?)
            """,id,dados.pedidoId(),Banco.id(usuario),UUID.fromString(pedido.get("produtorId").toString()),dados.nota(),PerfilService.seguro(dados.comentario()));
        return banco.um("select * from agroconnect.avaliacoes where id=?",id);
    }
}
