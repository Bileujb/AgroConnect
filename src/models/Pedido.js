export const STATUS_PEDIDO = {
  AGUARDANDO: 'aguardando',
  CONFIRMADO: 'confirmado',
  EM_ROTA: 'em_rota',
  ENTREGUE: 'entregue',
  CANCELADO: 'cancelado',
};

export class Pedido {
  constructor({
    id,
    consumidorId,
    produtorId,
    status,
    itens,
    valorTotal,
    enderecoEntrega,
    createdAt,
  }) {
    this.id = id;
    this.consumidorId = consumidorId;
    this.produtorId = produtorId;
    this.status = status || STATUS_PEDIDO.AGUARDANDO;
    this.itens = itens || [];
    this.valorTotal = valorTotal ?? 0;
    this.enderecoEntrega = enderecoEntrega;
    this.createdAt = createdAt || new Date().toISOString();
  }

  confirmar() {
    this.status = STATUS_PEDIDO.CONFIRMADO;
  }

  cancelar() {
    this.status = STATUS_PEDIDO.CANCELADO;
  }

  atualizarStatus(novoStatus) {
    if (!Object.values(STATUS_PEDIDO).includes(novoStatus)) {
      throw new Error(`Status inválido: ${novoStatus}`);
    }
    this.status = novoStatus;
  }
}