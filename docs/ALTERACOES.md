# O que mudou no repositório

Antes, o login aceitava qualquer credencial, gerava um ID local e mantinha os cadastros em memória. Produtos, pedidos e avaliações desapareciam ao reiniciar o aplicativo.

Agora, o Supabase Auth autentica as contas e a API Java persiste os dados no PostgreSQL. Cada perfil está ligado ao UUID da conta autenticada. A navegação abre a área correta conforme o tipo salvo no banco.

## Aplicativo

- Login/cadastro reais, mensagens de erro, confirmação de senha e estado de envio.
- Recuperação de senha, Meu Perfil e Alterar Senha.
- Tokens no SecureStore do Android; sessão temporária no navegador; renovação automática e limpeza ao sair.
- Contexts conectados à API, com carregamento, tentativa novamente e atualização das listas.
- Produtos persistidos, imagem por URL, confirmação de exclusão e estoque validado.
- Checkout real e pedidos separados por produtor.
- Área de pedidos do produtor para gerenciar a entrega.
- Consumidor consulta itens, cancela pedidos aguardando e avalia após a entrega.
- Dados e carrinho reiniciados ao trocar de conta.
- Remoção dos arquivos SQLite comentados e do botão Google que não possuía integração.

## Backend e banco

- Java 17, Spring Boot, Bean Validation, JdbcTemplate e driver PostgreSQL.
- Integração REST com Supabase Auth sem armazenar senhas de usuários na aplicação.
- Verificação da sessão e do dono do registro nas operações.
- SQL parametrizado e erros em formato JSON para o app.
- Transações e locks para estoque/checkout/cancelamento.
- Histórico de preços dos itens e remoção lógica dos produtos.
- Schema privado com seis tabelas, índices, chaves estrangeiras, restrições e RLS.
- Configurações de ambiente separadas do código e Maven Wrapper para Windows/Linux/macOS.
- Testes automatizados e instruções para executar e demonstrar o projeto.

O projeto não foi publicado em um servidor nem enviado automaticamente ao GitHub. O ZIP contém o código para vocês configurarem, executarem e versionarem no repositório do grupo.
