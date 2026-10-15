export function adicionarAoCarrinho(itens, produto, quantidade = 1) {
  if (!Number.isInteger(quantidade) || quantidade < 1) throw new Error('Quantidade inválida.');
  const existente = itens.find((i) => i.produtoId === produto.id);
  const total = (existente?.quantidade || 0) + quantidade;
  if (total > produto.quantidadeEstoque) throw new Error('A quantidade excede o estoque disponível.');
  if (existente) return itens.map((i) => i.produtoId === produto.id ? { ...i, quantidade: total, precoUnitario: produto.preco } : i);
  return [...itens, { produtoId: produto.id, produtorId: produto.produtorId, nome: produto.nome,
    precoUnitario: produto.preco, quantidade }];
}
