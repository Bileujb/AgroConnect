export class Usuario {
  constructor({ id, nome, email, cpf, senhaHash, tipoUsuario, createdAt }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.senhaHash = senhaHash;
    this.tipoUsuario = tipoUsuario; // 'produtor' | 'consumidor' | 'admin'
    this.createdAt = createdAt || new Date().toISOString();
  }

  atualizarPerfil(dados) {
    Object.assign(this, dados);
  }

  desativarConta() {
    this.ativo = false;
  }
}