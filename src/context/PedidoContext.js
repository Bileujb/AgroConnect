import React, { createContext, useContext } from 'react';
import useListaApi from '../hooks/useListaApi';
import { api } from '../services/api';

const PedidoContext = createContext(null);
export function PedidoProvider({ children }) {
  const lista = useListaApi('/api/pedidos');
  async function criarPedido({ itens, chave }) {
    const salvos = await api('/api/pedidos', { method: 'POST', body: {
      chave, itens: itens.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade })),
    } });
    lista.setDados((atual) => [...salvos, ...atual.filter((p) => !salvos.some((s) => s.id === p.id))]);
    return salvos;
  }
  async function atualizarStatus(id, status) {
    const salvo = await api(`/api/pedidos/${id}/status`, { method: 'PATCH', body: { status } });
    lista.setDados((atual) => atual.map((p) => p.id === id ? { ...p, ...salvo } : p)); return salvo;
  }
  return <PedidoContext.Provider value={{ pedidos: lista.dados, carregando: lista.carregando, erro: lista.erro,
    recarregar: lista.recarregar, criarPedido, atualizarStatus,
    pedidosDoConsumidor: (id) => lista.dados.filter((p) => p.consumidorId === id),
    pedidosDoProdutor: (id) => lista.dados.filter((p) => p.produtorId === id) }}>{children}</PedidoContext.Provider>;
}
export function usePedidos() { return useContext(PedidoContext); }
