import test from 'node:test';
import assert from 'node:assert/strict';
import { adicionarAoCarrinho } from '../src/utils/carrinho.js';
const produto = { id: 'p1', produtorId: 'u1', nome: 'Alface', preco: 3.5, quantidadeEstoque: 5 };
test('somar um item existente respeita o estoque total, não apenas a última adição', () => {
  const itens = adicionarAoCarrinho([], produto, 4);
  assert.throws(() => adicionarAoCarrinho(itens, produto, 2), /estoque/);
  assert.equal(adicionarAoCarrinho(itens, produto, 1)[0].quantidade, 5);
  assert.equal(itens[0].quantidade, 4);
});
test('rejeita quantidade negativa, fracionária e produto sem estoque', () => {
  for (const valor of [-1, 0, 0.5, NaN]) assert.throws(() => adicionarAoCarrinho([], produto, valor));
  assert.throws(() => adicionarAoCarrinho([], { ...produto, quantidadeEstoque: 0 }));
});
test('misturar produtores mantém itens separados para o checkout dividir os pedidos', () => {
  let itens = adicionarAoCarrinho([], produto);
  itens = adicionarAoCarrinho(itens, { ...produto, id: 'p2', produtorId: 'u2' });
  assert.deepEqual(itens.map((i) => i.produtorId), ['u1', 'u2']);
});
