import React, { createContext, useContext, useState } from 'react';

const PedidoContext = createContext(null);

export function PedidoProvider({ children }) {
  const [pedidos, setPedidos] = useState([]);

  function criarPedido({ consumidorId, itens, valorTotal }) {
    // cada item do carrinho pode ser de um produtor diferente;
    // por simplicidade agora, assumimos 1 produtor por pedido (o do primeiro item)
    const novoPedido = {
      id: Date.now().toString(),
      consumidorId,
      produtorId: itens[0]?.produtorId,
      itens,
      valorTotal,
      status: 'aguardando',
      createdAt: new Date().toISOString(),
    };
    setPedidos((atual) => [...atual, novoPedido]);
    return novoPedido;
  }

  function atualizarStatus(pedidoId, novoStatus) {
    setPedidos((atual) =>
      atual.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p))
    );
  }

  function pedidosDoConsumidor(consumidorId) {
    return pedidos.filter((p) => p.consumidorId === consumidorId);
  }

  function pedidosDoProdutor(produtorId) {
    return pedidos.filter((p) => p.produtorId === produtorId);
  }

  return (
    <PedidoContext.Provider
      value={{ pedidos, criarPedido, atualizarStatus, pedidosDoConsumidor, pedidosDoProdutor }}
    >
      {children}
    </PedidoContext.Provider>
  );
}

export function usePedidos() {
  const context = useContext(PedidoContext);
  if (!context) throw new Error('usePedidos deve ser usado dentro de PedidoProvider');
  return context;
}