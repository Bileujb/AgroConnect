# API e decisões do projeto

O aplicativo envia JSON para o Java. O Java usa o Supabase Auth para validar a sessão e o PostgreSQL para persistir os dados. A senha nunca é salva nas tabelas da aplicação.

O token é enviado no cabeçalho `Authorization: Bearer TOKEN`. Rotas `/api` exigem autenticação, exceto `/api/saude`. Os dados do usuário vêm do token validado, não de um ID enviado pelo aplicativo.

| Método | Rota | Uso |
|---|---|---|
| POST | `/auth/cadastro` | Nome, e-mail, senha, tipo e endereço; pode pedir confirmação de e-mail |
| POST | `/auth/login` | E-mail e senha; retorna sessão e perfil |
| POST | `/auth/renovar` | Troca refreshToken por nova sessão |
| POST | `/auth/recuperar` | Recebe e-mail e solicita recuperação |
| POST | `/auth/nova-senha` | Recebe senha, com token do link de recuperação |
| POST | `/auth/sair` | Encerra a sessão atual no Supabase |
| GET | `/api/saude` | Verifica API e tabela de usuários |
| GET / PUT | `/api/perfil` | Consulta ou edita o próprio perfil |
| POST | `/api/perfil/senha` | senhaAtual e novaSenha; retorna sessão |
| GET | `/api/produtos` | Catálogo; `?meus=true` retorna apenas os próprios produtos |
| GET | `/api/produtos/{id}` | Detalhes do produto ativo |
| POST | `/api/produtos` | Cadastra produto do produtor autenticado |
| PUT / DELETE | `/api/produtos/{id}` | Edita ou retira o próprio produto do catálogo |
| GET | `/api/pedidos` | Pedidos do consumidor/produtor autenticado |
| POST | `/api/pedidos` | Checkout: chave e itens com produtoId/quantidade |
| PATCH | `/api/pedidos/{id}/status` | Atualiza status, conforme papel e estado atual |
| GET / POST | `/api/avaliacoes` | Consulta avaliações vinculadas à conta ou cria uma |

Exemplo de checkout (não enviar preço, total, ID do consumidor ou produtor):

```json
{"chave":"identificador-da-tentativa","itens":[{"produtoId":"UUID-DO-PRODUTO","quantidade":2}]}
```

O Java retorna uma lista, pois um carrinho pode gerar pedidos de vários produtores. A mesma chave com os mesmos itens retorna os pedidos anteriores. A mesma chave com outros itens é recusada. O app mantém essa chave durante uma tentativa; ela não é um identificador secreto.

## Por que usamos transação?

A baixa do estoque e a criação dos pedidos precisam acontecer juntas. Se faltar estoque em um produto, o banco desfaz o checkout inteiro. Locks nas linhas dos produtos impedem dois compradores de comprar a mesma última unidade. O preço é sempre consultado no banco; o total mostrado no carrinho é estimado até a confirmação.

O cancelamento bloqueia o pedido e devolve o estoque uma vez. Produtos removidos ficam inativos para preservar os itens e preços dos pedidos antigos. Avaliações exigem pedido entregue e não podem ser duplicadas.

## Organização e limites

Controllers recebem HTTP; records de `Dados` validam os formulários; services implementam as regras; `Banco` executa consultas parametrizadas com JdbcTemplate. Não usamos microsserviços, filas ou uma camada de abstração para cada tabela.

O perfil usa o mesmo UUID de `auth.users`. Produtor/consumidor são escolhas permitidas no cadastro; não existe papel de administrador. O papel persistido não pode ser alterado pela tela de perfil. Os metadados do Auth são usados apenas na criação inicial do perfil.

O schema privado tem RLS habilitado e acesso direto revogado para anon/authenticated. O backend conecta com postgres e, portanto, aplica as permissões em Java. Nunca exponha a senha JDBC no app. Para uma publicação comercial, será necessário separar credenciais de banco por privilégio, publicar a API em HTTPS e configurar SMTP, backups, monitoramento e limites de requisições conforme o ambiente.

As listagens são limitadas a 1.000 produtos e 500 pedidos por conta, adequadas à demonstração acadêmica. Um catálogo maior precisará de paginação. A estrutura foi aplicada ao schema `agroconnect` do projeto configurado; tabelas de outros schemas não foram alteradas.
