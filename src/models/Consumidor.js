import { Usuario } from './Usuario';

export class Consumidor extends Usuario {
  constructor(dados) {
    super(dados);
    this.enderecoEntrega = dados.enderecoEntrega || '';
    this.cidade = dados.cidade || '';
    this.historicoPedidos = dados.historicoPedidos || [];
    this.favoritos = dados.favoritos || [];
  }

  realizarPedido(itensCarrinho, enderecoEntrega) {
    if (!itensCarrinho || itensCarrinho.length === 0) {
      throw new Error('Carrinho vazio');
    }
    const valorTotal = itensCarrinho.reduce(
      (soma, item) => soma + item.quantidade * item.precoUnitario,
      0
    );
    return {
      consumidorId: this.id,
      itens: itensCarrinho,
      valorTotal,
      enderecoEntrega: enderecoEntrega || this.enderecoEntrega,
      status: 'aguardando',
    };
  }

  avaliarProdutor(produtorId, pedidoId, nota, comentario) {
    if (nota < 1 || nota > 5) throw new Error('Nota deve estar entre 1 e 5');
    return {
      avaliadorId: this.id,
      avaliandoId: produtorId,
      pedidoId,
      nota,
      comentario,
    };
  }

  buscarProdutos(catalogo, termo) {
    const termoBusca = (termo || '').toLowerCase();
    return catalogo.filter((p) => p.nome.toLowerCase().includes(termoBusca));
  }
}