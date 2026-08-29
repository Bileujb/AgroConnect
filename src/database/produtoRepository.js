/*import { getDb } from './db';

// CREATE - INSERE UM NOVO PRODUTO NO BANCO
export async function inserirProduto(produto) {
    const db = await getDb();
    await db.runAsync(
        `INSERT INTO produtos (id, nome, descricao, preco, categoria, quantidadeEstoque, produtorId)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            produto.id,
            produto.nome,
            produto.descricao,
            produto.preco,
            produto.categoria,
            produto.quantidadeEstoque,
            produto.produtorId,
        ]
    );
}

// READ - BUSCAR TODOS OS PRODUTOS CADASTRADOS
export async function listarProdutos() {
    const db = await getDb();
    return db.getAllAsync('SELECT * FROM produtos ORDER BY nome');
}

// READ — busca só os produtos de um produtor específico
export async function listarProdutosPorProdutor(produtorId) {
    const db = await getDb();
    return db.getAllAsync('SELECT * FROM produtos WHERE produtorId = ? ORDER BY nome', [produtorId]);
}

// UPDATE - ATUALIZA UM PRODUTO EXISTENTE
export async function atualizarProdutoNoBanco(id, dados) {
    const db = await getDb();
    await db.runAsync(
        `UPDATE produtos
     SET nome = ?, descricao = ?, preco = ?, categoria = ?, quantidadeEstoque = ?
     WHERE id = ?`,
        [dados.nome, dados.descricao || '', dados.preco, dados.categoria, dados.quantidadeEstoque, id]
    );
}

// DELETE - APAGAR UM PRODUTO
export async function removerProdutoDoBanco(id) {
    const db = await getDb();
    await db.runAsync('DELETE FROM produtos WHERE id = ?', [id]);
}*/