package br.com.agroconnect;

import java.net.URI;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class ProdutoService {
    final Banco banco;
    static final String SELECT = """
        select p.*,u.cidade as cidade_produtor,u.nome as nome_produtor,u.nome_fazenda,
          (select round(avg(a.nota),2) from agroconnect.avaliacoes a where a.produtor_id=p.produtor_id) as nota_media
        from agroconnect.produtos p join agroconnect.usuarios u on u.id=p.produtor_id
        """;
    public ProdutoService(Banco banco) { this.banco=banco; }
    public List<Map<String,Object>> listar(Map<String,Object> usuario, boolean meus) {
        if (meus) {
            Banco.exigirTipo(usuario,"produtor");
            return banco.listar(SELECT+" where p.ativo=true and p.produtor_id=? order by p.created_at desc",Banco.id(usuario));
        }
        return banco.listar(SELECT+" where p.ativo=true order by p.created_at desc limit 1000");
    }
    public Map<String,Object> obter(UUID id) { return banco.um(SELECT+" where p.id=? and p.ativo=true",id); }
    static void validarImagem(String imagem) {
        if (imagem==null || imagem.isBlank()) return;
        try {
            var uri=URI.create(imagem);
            if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme())) || uri.getHost()==null) {
                throw ApiException.invalido("Use uma URL http ou https para a imagem.");
            }
        } catch (IllegalArgumentException erro) { throw ApiException.invalido("A URL da imagem é inválida."); }
    }
    public Map<String,Object> cadastrar(Map<String,Object> usuario, Dados.Produto dados) {
        Banco.exigirTipo(usuario,"produtor"); validarImagem(dados.imagem());
        UUID id=UUID.randomUUID();
        banco.jdbc.update("""
            insert into agroconnect.produtos (id,produtor_id,nome,descricao,preco,categoria,quantidade_estoque,imagem)
            values (?,?,?,?,?,?,?,?)
            """,id,Banco.id(usuario),dados.nome().trim(),PerfilService.seguro(dados.descricao()),dados.preco(),dados.categoria(),dados.quantidadeEstoque(),dados.imagem());
        return obter(id);
    }
    public Map<String,Object> atualizar(Map<String,Object> usuario, UUID id, Dados.Produto dados) {
        Banco.exigirTipo(usuario,"produtor"); validarImagem(dados.imagem());
        int atualizados=banco.jdbc.update("""
            update agroconnect.produtos set nome=?,descricao=?,preco=?,categoria=?,quantidade_estoque=?,imagem=?
            where id=? and produtor_id=? and ativo=true
            """,dados.nome().trim(),PerfilService.seguro(dados.descricao()),dados.preco(),dados.categoria(),dados.quantidadeEstoque(),dados.imagem(),id,Banco.id(usuario));
        if (atualizados==0) throw ApiException.naoEncontrado();
        return obter(id);
    }
    public void remover(Map<String,Object> usuario, UUID id) {
        Banco.exigirTipo(usuario,"produtor");
        if (banco.jdbc.update("update agroconnect.produtos set ativo=false where id=? and produtor_id=? and ativo=true",id,Banco.id(usuario))==0) {
            throw ApiException.naoEncontrado();
        }
    }
}
