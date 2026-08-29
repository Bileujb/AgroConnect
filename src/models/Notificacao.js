export class Notificacao {
  constructor({ id, usuarioId, tipo, mensagem, canal, lida, createdAt }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.tipo = tipo;
    this.mensagem = mensagem;
    this.canal = canal || 'push'; // 'push' | 'sms' | 'email'
    this.lida = lida ?? false;
    this.createdAt = createdAt || new Date().toISOString();
  }

  marcarComoLida() {
    this.lida = true;
  }
}