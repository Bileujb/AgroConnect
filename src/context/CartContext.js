import React, { createContext, useContext, useState, useMemo, useRef } from 'react';
import { adicionarAoCarrinho } from '../utils/carrinho';
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [itens, setItens] = useState([]);
  const solicitacao = useRef({ assinatura: '', chave: '' });
  function adicionarItem(produto, quantidade = 1) {
    // Validação antes do setState permite mostrar o erro no evento do botão.
    const novos = adicionarAoCarrinho(itens, produto, quantidade);
    setItens(novos);
  }
  function chaveCheckout() {
    const assinatura = JSON.stringify(itens.map((i) => [i.produtoId, i.quantidade]));
    if (assinatura !== solicitacao.current.assinatura) solicitacao.current = {
      assinatura, chave: `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
    };
    return solicitacao.current.chave;
  }
  const valorTotal = useMemo(() => itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0), [itens]);
  return <CartContext.Provider value={{ itens, adicionarItem, valorTotal, chaveCheckout,
    removerItem: (id) => setItens((atual) => atual.filter((i) => i.produtoId !== id)),
    limparCarrinho: () => { setItens([]); solicitacao.current = { assinatura: '', chave: '' }; },
  }}>{children}</CartContext.Provider>;
}
export function useCart() { return useContext(CartContext); }
