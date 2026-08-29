export class Produto {
  constructor({
    id,
    nome,
    descricao,
    preco,
    categoria,
    quantidadeEstoque,
    imagem,
    produtorId,
    createdAt,
  }) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao || '';
    this.preco = preco;
    this.categoria = categoria;
    this.quantidadeEstoque = quantidadeEstoque ?? 0;
    this.imagem = imagem || null;
    this.produtorId = produtorId;
    this.createdAt = createdAt || new Date().toISOString();
  }

  calcularDisponibilidade() {
    return this.quantidadeEstoque > 0;
  }

  atualizarEstoque(quantidade) {
    if (this.quantidadeEstoque + quantidade < 0) {
      throw new Error('Estoque insuficiente');
    }
    this.quantidadeEstoque += quantidade;
  }
}