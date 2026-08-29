import React, { createContext, useContext, useState } from 'react';

const AvaliacaoContext = createContext(null);

export function AvaliacaoProvider({ children }) {
  const [avaliacoes, setAvaliacoes] = useState([]);

  function avaliarProdutor({ produtorId, consumidorId, pedidoId, nota, comentario }) {
    if (nota < 1 || nota > 5) {
      throw new Error('Nota deve estar entre 1 e 5');
    }

    const novaAvaliacao = {
      id: Date.now().toString(),
      produtorId,
      consumidorId,
      pedidoId,
      nota,
      comentario: comentario || '',
      createdAt: new Date().toISOString(),
    };

    setAvaliacoes((atual) => [...atual, novaAvaliacao]);
    return novaAvaliacao;
  }

  // Calcula a média de notas de um produtor específico (igual a "nota da loja" do iFood)
  function mediaDoProdutor(produtorId) {
    const avaliacoesDoProdutor = avaliacoes.filter((a) => a.produtorId === produtorId);
    if (avaliacoesDoProdutor.length === 0) return null; // ainda sem avaliação nenhuma

    const soma = avaliacoesDoProdutor.reduce((total, a) => total + a.nota, 0);
    return soma / avaliacoesDoProdutor.length;
  }

  function jaAvaliouPedido(pedidoId) {
    return avaliacoes.some((a) => a.pedidoId === pedidoId);
  }

  return (
    <AvaliacaoContext.Provider value={{ avaliacoes, avaliarProdutor, mediaDoProdutor, jaAvaliouPedido }}>
      {children}
    </AvaliacaoContext.Provider>
  );
}

export function useAvaliacoes() {
  const context = useContext(AvaliacaoContext);
  if (!context) throw new Error('useAvaliacoes deve ser usado dentro de AvaliacaoProvider');
  return context;
}