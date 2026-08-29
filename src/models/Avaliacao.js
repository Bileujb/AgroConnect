const PALAVRAS_BLOQUEADAS = ['idiota', 'burro', 'lixo'];

export class Avaliacao {
  constructor({ id, avaliadorId, avaliandoId, pedidoId, nota, comentario, createdAt }) {
    if (nota < 1 || nota > 5) throw new Error('Nota deve estar entre 1 e 5');
    this.id = id;
    this.avaliadorId = avaliadorId;
    this.avaliandoId = avaliandoId;
    this.pedidoId = pedidoId;
    this.nota = nota;
    this.comentario = comentario || '';
    this.createdAt = createdAt || new Date().toISOString();
  }

  flagarInapropriado() {
    const texto = this.comentario.toLowerCase();
    return PALAVRAS_BLOQUEADAS.some((palavra) => texto.includes(palavra));
  }
}