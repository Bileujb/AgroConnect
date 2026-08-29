export class ItemPedido {
  constructor({ id, pedidoId, produtoId, quantidade, precoUnitario }) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.produtoId = produtoId;
    this.quantidade = quantidade;
    this.precoUnitario = precoUnitario;
  }

  calcularSubtotal() {
    return this.quantidade * this.precoUnitario;
  }
}