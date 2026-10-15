import React, { createContext, useContext } from 'react';
import useListaApi from '../hooks/useListaApi';
import { api } from '../services/api';

const AvaliacaoContext = createContext(null);
export function AvaliacaoProvider({ children }) {
  const lista = useListaApi('/api/avaliacoes');
  async function avaliarProdutor({ pedidoId, nota, comentario }) {
    const salva = await api('/api/avaliacoes', { method: 'POST', body: { pedidoId, nota, comentario } });
    lista.setDados((atual) => [salva, ...atual]); return salva;
  }
  function mediaDoProdutor(id) {
    const notas = lista.dados.filter((a) => a.produtorId === id);
    return notas.length ? notas.reduce((s, a) => s + a.nota, 0) / notas.length : null;
  }
  return <AvaliacaoContext.Provider value={{ avaliacoes: lista.dados, avaliarProdutor, mediaDoProdutor,
    jaAvaliouPedido: (id) => lista.dados.some((a) => a.pedidoId === id), recarregar: lista.recarregar,
    carregando: lista.carregando, erro: lista.erro }}>{children}</AvaliacaoContext.Provider>;
}
export function useAvaliacoes() { return useContext(AvaliacaoContext); }
