import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import useListaApi from '../hooks/useListaApi';
import { api } from '../services/api';

const ProdutoContext = createContext(null);
const camposProduto = (p) => ({ nome: p.nome.trim(), descricao: p.descricao || '', preco: p.preco,
  categoria: p.categoria, quantidadeEstoque: p.quantidadeEstoque, imagem: p.imagem || null });
export function ProdutoProvider({ children }) {
  const { usuario } = useAuth();
  const lista = useListaApi(`/api/produtos${usuario?.tipoUsuario === 'produtor' ? '?meus=true' : ''}`);
  async function cadastrarProduto(dados) {
    const salvo = await api('/api/produtos', { method: 'POST', body: camposProduto(dados) });
    lista.setDados((atual) => [salvo, ...atual]); return salvo;
  }
  async function atualizarProduto(id, dados) {
    const salvo = await api(`/api/produtos/${id}`, { method: 'PUT', body: camposProduto(dados) });
    lista.setDados((atual) => atual.map((p) => p.id === id ? salvo : p)); return salvo;
  }
  async function removerProduto(id) {
    await api(`/api/produtos/${id}`, { method: 'DELETE' });
    lista.setDados((atual) => atual.filter((p) => p.id !== id));
  }
  return <ProdutoContext.Provider value={{ produtos: lista.dados, carregando: lista.carregando, erro: lista.erro,
    recarregar: lista.recarregar, cadastrarProduto, atualizarProduto, removerProduto,
    produtosDoProdutor: (id) => lista.dados.filter((p) => p.produtorId === id) }}>{children}</ProdutoContext.Provider>;
}
export function useProdutos() { return useContext(ProdutoContext); }
