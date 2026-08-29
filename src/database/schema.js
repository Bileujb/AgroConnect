// Aqui a gente descreve como cada tabela do banco vai ser organizada.
// Isso é escrito em SQL — uma linguagem própria pra bancos de dados.

/*export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS usuarios (
    id text primary key,
    nome text not null,
    email text not null,
    senha text not null,
    tipoUsuario text not null,
    cidade text,
    nomeFazenda text,
    cnpj text,
    enderecoFazenda text,
    enderecoEntrega text
 );

 CREATE TABLE IF NOT EXISTS produtos(
    id text primary key,
    nome text not null,
    descricao text,
    preco REAL not null,
    categoria text not null,
    quantidadeEstoque integer not null default 0,
    produtorId text not null
 );

 CREATE TABLE IF NOT EXISTS pedidos(
    id text primary key,
    consumidorId text not null,
    produtorId text not null,
    status text not null default 'aguardando',
    valorTotal REAL not null,
    itens text not null,
    createdAt text
 );
`;*/

 /*Lembrando o principal: cada CREATE TABLE é o "desenho" de uma tabela — como se fosse as colunas de uma planilha. id TEXT PRIMARY KEY é o identificador único de cada linha; NOT NULL 
 significa "obrigatório"; e o campo itens da tabela pedidos vai guardar uma lista de produtos como texto (JSON), porque o SQLite não tem um jeito nativo de guardar listas dentro de uma célula.
Cria os dois arquivos, salva, e me avisa — o próximo passo é testar se o banco abre sem erro (vamos fazer um teste simples, parecido com aquele que fizemos lá no início com os models).*/