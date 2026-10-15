import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { criarCliente } from './httpClient';

// Android Emulator usa 10.0.2.2 para acessar o computador que executa a API.
const baseUrl = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');
const nomes = ['agroconnect.access', 'agroconnect.refresh', 'agroconnect.expires'];
const ler = async (chave) => Platform.OS === 'web'
  ? globalThis.sessionStorage?.getItem(chave) ?? null : SecureStore.getItemAsync(chave);
const salvar = async (chave, valor) => {
  if (Platform.OS === 'web') globalThis.sessionStorage?.setItem(chave, valor);
  else await SecureStore.setItemAsync(chave, valor);
};
const apagar = async (chave) => {
  if (Platform.OS === 'web') globalThis.sessionStorage?.removeItem(chave);
  else await SecureStore.deleteItemAsync(chave);
};
const storage = {
  async ler() {
    const [accessToken, refreshToken, expiresAt] = await Promise.all(nomes.map(ler));
    return accessToken && refreshToken ? { accessToken, refreshToken, expiresAt: Number(expiresAt) } : null;
  },
  async salvar(dados) {
    // Tokens ficam em entradas separadas para respeitar o limite do armazenamento nativo.
    await salvar(nomes[1], dados.refreshToken);
    await salvar(nomes[0], dados.accessToken);
    await salvar(nomes[2], String(dados.expiresAt));
  },
  async apagar() { await Promise.all(nomes.map(apagar)); },
};
export const cliente = criarCliente({ baseUrl, storage });
export const api = cliente.api;
export const requisicaoPublica = cliente.enviar;
