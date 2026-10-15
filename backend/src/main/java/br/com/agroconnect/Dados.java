package br.com.agroconnect;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

// Records são objetos simples usados para receber os formulários do aplicativo.
public final class Dados {
    private Dados() {}
    public record Login(@NotBlank @Email @Size(max=254) String email,
                        @NotBlank @Size(max=200) String senha) {}
    public record Cadastro(@NotBlank @Size(min=3,max=120) String nome,
        @NotBlank @Email @Size(max=254) String email, @NotBlank @Size(min=8,max=72) String senha,
        @NotBlank @Pattern(regexp="produtor|consumidor") String tipoUsuario,
        @NotBlank @Size(max=80) String cidade,
        @Size(max=120) String nomeFazenda, @Size(max=30) String cnpj,
        @Size(max=300) String enderecoFazenda, @Size(max=300) String enderecoEntrega) {}
    public record Perfil(@NotBlank @Size(min=3,max=120) String nome,
        @NotBlank @Size(max=80) String cidade, @Size(max=120) String nomeFazenda,
        @Size(max=30) String cnpj, @Size(max=300) String enderecoFazenda,
        @Size(max=300) String enderecoEntrega) {}
    public record EmailRecuperacao(@NotBlank @Email @Size(max=254) String email) {}
    public record Renovar(@NotBlank @Size(max=4096) String refreshToken) {}
    public record NovaSenha(@NotBlank @Size(min=8,max=72) String senha) {}
    public record TrocarSenha(@NotBlank @Size(max=200) String senhaAtual,
                             @NotBlank @Size(min=8,max=72) String novaSenha) {}
    public record Produto(@NotBlank @Size(max=120) String nome, @Size(max=2000) String descricao,
        @NotNull @DecimalMin("0.01") @DecimalMax("99999999.99") @Digits(integer=8,fraction=2) BigDecimal preco,
        @NotBlank @Pattern(regexp="Verduras|Legumes|Frutas|Derivados") String categoria,
        @NotNull @Min(0) @Max(1000000) Integer quantidadeEstoque,
        @Size(max=2048) String imagem) {}
    public record Item(@NotNull UUID produtoId, @Min(1) @Max(10000) int quantidade) {}
    public record Checkout(@NotBlank @Size(max=100) String chave,
                           @NotEmpty @Size(max=100) List<@NotNull @Valid Item> itens) {}
    public record Status(@NotBlank @Pattern(regexp="confirmado|em_rota|entregue|cancelado") String status) {}
    public record Avaliacao(@NotNull UUID pedidoId, @NotNull @Min(1) @Max(5) Integer nota,
                            @Size(max=1000) String comentario) {}
}
