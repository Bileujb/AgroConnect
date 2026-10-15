export class Usuario {
  constructor({ id, nome, email, cpf, tipoUsuario, createdAt }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.cpf = cpf;
    this.tipoUsuario = tipoUsuario; // 'produtor' | 'consumidor' | 'admin'
    this.createdAt = createdAt || new Date().toISOString();
  }

  atualizarPerfil(dados) {
    for (const campo of ['nome', 'email', 'cpf']) {
      if (dados[campo] !== undefined) this[campo] = dados[campo];
    }
  }

  desativarConta() {
    this.ativo = false;
  }
}