// Cliente HTTP independente do React Native para conseguirmos testá-lo com Node.
export class ApiError extends Error {
  constructor(mensagem, status = 0) { super(mensagem); this.status = status; }
}

export function criarCliente({ baseUrl, storage, fetchImpl = globalThis.fetch, timeoutMs = 20000 }) {
  let sessao;
  let renovacao = null;
  let geracao = 0;
  let aoExpirar = () => {};

  let gravacao = Promise.resolve();
  function persistir(acao) {
    const proxima = gravacao.then(acao, acao);
    gravacao = proxima.catch(() => {});
    return proxima;
  }
  async function lerSessao() {
    const versao = geracao;
    if (sessao === undefined) {
      const salva = await storage.ler();
      if (versao === geracao && sessao === undefined) sessao = salva;
    }
    return sessao;
  }
  async function definirSessao(dados) {
    const versao = ++geracao;
    sessao = dados;
    try { await persistir(async () => { if (versao === geracao) await storage.salvar(dados); }); }
    catch { if (versao === geracao) sessao = null; throw new ApiError('Não foi possível guardar a sessão neste dispositivo.'); }
  }
  async function limparSessao() {
    geracao += 1;
    sessao = null;
    await persistir(() => storage.apagar());
  }
  async function expirar() {
    try { await limparSessao(); } finally { aoExpirar(); }
  }
  async function enviar(caminho, { method = 'GET', body, token } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(baseUrl.replace(/\/$/, '') + caminho, {
        method, signal: controller.signal,
        headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      const texto = await response.text();
      let dados;
      try { dados = texto ? JSON.parse(texto) : null; }
      catch { throw new ApiError('O servidor respondeu em um formato inesperado.', response.status); }
      if (!response.ok) throw new ApiError(dados?.mensagem || 'Não foi possível concluir a solicitação.', response.status);
      return dados;
    } catch (erro) {
      if (erro instanceof ApiError) throw erro;
      throw new ApiError(erro.name === 'AbortError'
        ? 'A solicitação demorou demais. Confira a conexão e atualize a tela.'
        : 'Não foi possível acessar a API. Confira se o backend está ligado e o endereço está correto.');
    } finally { clearTimeout(timer); }
  }
  async function renovar() {
    if (renovacao) return renovacao;
    const versao = geracao;
    renovacao = (async () => {
      const atual = await lerSessao();
      if (!atual?.refreshToken) throw new ApiError('Entre novamente.', 401);
      try {
        const nova = await enviar('/auth/renovar', { method: 'POST', body: { refreshToken: atual.refreshToken } });
        if (versao !== geracao) throw new ApiError('A sessão foi encerrada.', 401);
        sessao = nova;
        await persistir(async () => { if (versao === geracao) await storage.salvar(nova); });
        if (versao !== geracao) throw new ApiError('A sessão foi encerrada.', 401);
        return nova;
      } catch (erro) {
        if (versao === geracao && [400, 401, 403].includes(erro.status)) await expirar();
        throw erro;
      }
    })().finally(() => { renovacao = null; });
    return renovacao;
  }
  async function api(caminho, opcoes = {}) {
    const versao = geracao;
    let atual = await lerSessao();
    if (!atual?.accessToken) throw new ApiError('Entre na sua conta.', 401);
    if (atual.expiresAt && atual.expiresAt <= Date.now() / 1000 + 30) atual = await renovar();
    try {
      const resposta = await enviar(caminho, { ...opcoes, token: atual.accessToken });
      if (versao !== geracao || sessao === null) {
        throw new ApiError('A sessão mudou.', 401);
      }
      return resposta;
    } catch (erro) {
      if (versao !== geracao || erro.status !== 401 || sessao === null) throw erro;
      // Uma requisição recusada antes de autenticar pode ser refeita após renovar.
      const nova = await renovar();
      try {
        const resposta = await enviar(caminho, { ...opcoes, token: nova.accessToken });
        if (versao !== geracao) throw new ApiError('A sessão mudou.', 401);
        return resposta;
      }
      catch (segunda) { if (versao === geracao && segunda.status === 401) await expirar(); throw segunda; }
    }
  }
  return { api, enviar, lerSessao, definirSessao, limparSessao,
    setAoExpirar: (callback) => { aoExpirar = callback || (() => {}); } };
}
