import test from 'node:test';
import assert from 'node:assert/strict';
import { criarCliente } from '../src/services/httpClient.js';
const responder = (dados, status = 200) => ({ ok: status < 400, status, text: async () => JSON.stringify(dados) });
const sessao = (token = 'antigo', id = 'u1') => ({ accessToken: token, refreshToken: `refresh-${token}`, expiresAt: 9999999999, usuario: { id } });
function ambiente(fetchImpl, inicial = sessao()) {
  let salvo = inicial;
  const storage = { ler: async () => salvo, salvar: async (s) => { salvo = s; }, apagar: async () => { salvo = null; } };
  return { cliente: criarCliente({ baseUrl: 'http://api.test', storage, fetchImpl }), salvo: () => salvo };
}
test('não trata falha HTTP como sucesso de cadastro', async () => {
  const { cliente } = ambiente(async () => responder({ mensagem: 'E-mail inválido.' }, 400));
  await assert.rejects(cliente.enviar('/auth/cadastro', { method: 'POST', body: {} }), /E-mail inválido/);
});
test('renova uma única vez quando duas chamadas recebem 401 juntas', async () => {
  let renovacoes = 0;
  const { cliente } = ambiente(async (url, opcoes) => {
    if (url.endsWith('/auth/renovar')) { renovacoes += 1; await new Promise((r) => setTimeout(r, 5)); return responder(sessao('novo')); }
    return opcoes.headers.Authorization === 'Bearer novo' ? responder({ nome: 'Ruan' }) : responder({ mensagem: 'Expirou' }, 401);
  });
  const respostas = await Promise.all([cliente.api('/api/perfil'), cliente.api('/api/produtos')]);
  assert.equal(renovacoes, 1); assert.equal(respostas[0].nome, 'Ruan');
});
test('falha de rede não apaga a sessão salva', async () => {
  const { cliente, salvo } = ambiente(async () => { throw new TypeError('offline'); });
  await assert.rejects(cliente.api('/api/perfil'), /backend/);
  assert.equal(salvo().accessToken, 'antigo');
});
test('logout durante renovação não permite ressuscitar os tokens', async () => {
  let terminar;
  const { cliente, salvo } = ambiente(async (url) => {
    if (url.endsWith('/auth/renovar')) return new Promise((resolve) => { terminar = () => resolve(responder(sessao('novo'))); });
    return responder({ mensagem: 'Expirou' }, 401);
  });
  const chamada = cliente.api('/api/perfil');
  while (!terminar) await new Promise((r) => setTimeout(r, 1));
  await cliente.limparSessao(); terminar();
  await assert.rejects(chamada); assert.equal(salvo(), null);
});
test('resposta antiga não é entregue depois de entrar em outra conta', async () => {
  let terminar;
  const { cliente } = ambiente(async () => new Promise((resolve) => { terminar = () => resolve(responder({ nome: 'Conta A' })); }));
  const chamada = cliente.api('/api/perfil');
  while (!terminar) await new Promise((r) => setTimeout(r, 1));
  await cliente.definirSessao(sessao('conta-b', 'u2')); terminar();
  await assert.rejects(chamada, /sessão/);
});
