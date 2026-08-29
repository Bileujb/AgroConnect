import React, { createContext, useContext, useState } from 'react';

const ProdutoContext = createContext(null);

export function ProdutoProvider({ children }) {
  const [produtos, setProdutos] = useState([]);

  function cadastrarProduto(dadosProduto, produtorId) {
    const novoProduto = {
      id: Date.now().toString(),
      ...dadosProduto,
      produtorId,
      createdAt: new Date().toISOString(),
    };
    setProdutos((atual) => [...atual, novoProduto]);
    return novoProduto;
  }

  function atualizarProduto(produtoId, dadosAtualizados) {
    setProdutos((atual) =>
      atual.map((p) => (p.id === produtoId ? { ...p, ...dadosAtualizados } : p))
    );
  }

  function removerProduto(produtoId) {
    setProdutos((atual) => atual.filter((p) => p.id !== produtoId));
  }

  function produtosDoProdutor(produtorId) {
    return produtos.filter((p) => p.produtorId === produtorId);
  }

  return (
    <ProdutoContext.Provider
      value={{ produtos, cadastrarProduto, atualizarProduto, removerProduto, produtosDoProdutor }}
    >
      {children}
    </ProdutoContext.Provider>
  );
}

export function useProdutos() {
  const context = useContext(ProdutoContext);
  if (!context) throw new Error('useProdutos deve ser usado dentro de ProdutoProvider');
  return context;
}