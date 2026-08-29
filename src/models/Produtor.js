import { Usuario } from './Usuario';

export class Produtor extends Usuario {
  constructor(dados) {
    super(dados);
    this.descricaoBio = dados.descricaoBio || '';
    this.nomeFazenda = dados.nomeFazenda || '';
    this.cnpj = dados.cnpj || '';
    this.enderecoFazenda = dados.enderecoFazenda || '';
    this.cidade = dados.cidade || '';
    this.localizacao = dados.localizacao || '';
    this.codigoProdutorRural = dados.codigoProdutorRural || null;
    this.notaMedia = dados.notaMedia || 0;
    this.offlineEnabled = dados.offlineEnabled ?? true;
  }

  cadastrarProduto(produto) {
    if (!produto.nome || produto.preco <= 0) {
      throw new Error('Produto inválido: nome e preço (> 0) são obrigatórios');
    }
    return { ...produto, produtorId: this.id };
  }

  gerenciarEstoque(produto, delta) {
    const novaQtd = produto.quantidadeEstoque + delta;
    if (novaQtd < 0) throw new Error('Estoque insuficiente');
    produto.quantidadeEstoque = novaQtd;
    return produto;
  }

  processarPedido(pedido, novoStatus) {
    pedido.status = novoStatus;
    return pedido;
  }

  sincronizarDados() {
    return { produtorId: this.id, sincronizadoEm: new Date().toISOString() };
  }
}