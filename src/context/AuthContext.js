import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, cliente, requisicaoPublica } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroInicial, setErroInicial] = useState('');

  async function restaurar() {
    setCarregando(true); setErroInicial('');
    try {
      const sessao = await cliente.lerSessao();
      if (sessao) setUsuario(await api('/api/perfil'));
    } catch (erro) {
      if ([400, 401, 403].includes(erro.status)) { await cliente.limparSessao(); setUsuario(null); }
      else setErroInicial(erro.message);
    } finally { setCarregando(false); }
  }
  useEffect(() => {
    cliente.setAoExpirar(() => setUsuario(null));
    restaurar();
    return () => cliente.setAoExpirar(null);
  }, []);
  async function aceitarSessao(dados) {
    await cliente.definirSessao(dados);
    setUsuario(dados.usuario);
    return dados.usuario;
  }
  async function login({ email, senha }) {
    return aceitarSessao(await requisicaoPublica('/auth/login', { method: 'POST', body: { email: email.trim(), senha } }));
  }
  async function cadastrar(dados) {
    const resposta = await requisicaoPublica('/auth/cadastro', { method: 'POST', body: dados });
    if (resposta.accessToken) await aceitarSessao(resposta);
    return resposta;
  }
  async function logout() {
    try { await api('/auth/sair', { method: 'POST' }); }
    finally { try { await cliente.limparSessao(); } finally { setUsuario(null); } }
  }
  async function atualizarPerfil(dados) {
    const atualizado = await api('/api/perfil', { method: 'PUT', body: dados });
    setUsuario(atualizado); return atualizado;
  }
  async function alterarSenha(senhaAtual, novaSenha) {
    const sessao = await api('/api/perfil/senha', { method: 'POST', body: { senhaAtual, novaSenha } });
    await aceitarSessao(sessao);
  }
  return <AuthContext.Provider value={{ usuario, carregando, erroInicial, restaurar, login, cadastrar, logout, atualizarPerfil, alterarSenha }}>
    {children}
  </AuthContext.Provider>;
}
export function useAuth() {
  const valor = useContext(AuthContext);
  if (!valor) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return valor;
}
