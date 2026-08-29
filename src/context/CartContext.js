import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);

  function adicionarItem(produto, quantidade = 1) {
    setItens((atual) => {
      const existente = atual.find((i) => i.produtoId === produto.id);
      if (existente) {
        return atual.map((i) =>
          i.produtoId === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i
        );
      }
      return [
        ...atual,
        {
          produtoId: produto.id,
          produtorId: produto.produtorId,
          nome: produto.nome,
          precoUnitario: produto.preco,
          quantidade,
        },
      ];
    });
  }

  function removerItem(produtoId) {
    setItens((atual) => atual.filter((i) => i.produtoId !== produtoId));
  }

  function limparCarrinho() {
    setItens([]);
  }

  const valorTotal = useMemo(
    () => itens.reduce((soma, i) => soma + i.quantidade * i.precoUnitario, 0),
    [itens]
  );

  return (
    <CartContext.Provider value={{ itens, adicionarItem, removerItem, limparCarrinho, valorTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider');
  return context;
}