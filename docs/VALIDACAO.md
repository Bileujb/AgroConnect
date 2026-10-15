# Validação desta entrega

## Executado no ambiente de desenvolvimento

- Sintaxe JavaScript/JSX e resolução de imports locais: 42 arquivos conferidos.
- Testes do cliente: 8 aprovados, 0 falhas. Cobrem estoque total do carrinho, quantidades inválidas, carrinho com produtores diferentes, erros HTTP, renovação concorrente da sessão, falha de rede e respostas antigas após sair/trocar de conta.
- Compatibilidade de dependências: `expo install --check` aprovado, com Expo 57.0.29 e React Native 0.86.3.
- Exportação do bundle Android pelo Expo SDK 57: concluída.
- Exportação web pelo Expo: concluída. A interface foi planejada principalmente para Android.
- Empacotamento Java: executável Spring Boot gerado com sucesso (o ZIP distribui os fontes; o executável pode ser gerado localmente).
- Testes Java: 13 aprovados, 0 falhas, 0 ignorados. São 9 testes de negócio com PostgreSQL temporário e 4 testes do cliente Supabase Auth com servidor HTTP local.

Os testes de negócio iniciam a API HTTP e executam o SQL incluído no pacote. Verificam autenticação obrigatória, isolamento de produtos por produtor, validação de entrada, preços calculados no servidor, divisão por produtor, rollback por falta de estoque, repetição de checkout, cancelamento, avaliação e compra concorrente da última unidade. A reexecução do SQL é testada sem apagar os registros existentes.

O PostgreSQL temporário usado nesta validação foi o 14.19. A dependência de testes inclui binários para os sistemas suportados. No executor, foi necessária uma adaptação temporária para inicializar o PostgreSQL em um ambiente que executa como root; ela não faz parte do projeto entregue. No seu computador, rode com seu usuário normal. Os testes usam TCP local.

## Verificado no Supabase real

- Projeto `mxdbrnzjmtyhxsbndjxm`, São Paulo, ativo e saudável; PostgreSQL 17.11.
- Ausência de tabelas da aplicação antes da configuração, nos schemas `public` e `agroconnect`.
- Migração `agroconnect_initial_schema` aplicada com sucesso: seis tabelas, índices, chaves estrangeiras e validações.
- Consultas reais às seis tabelas concluídas; ainda sem cadastros, produtos ou pedidos.
- RLS habilitado nas seis tabelas. Acesso direto ao schema negado para anon; leitura direta anon e atualização direta authenticated negadas nas tabelas.
- Endpoint público de configuração do Supabase Auth respondeu HTTP 200 usando a chave publishable do projeto. E-mail/senha e novos cadastros estão habilitados; confirmação automática está desabilitada, portanto o usuário deve confirmar o e-mail.
- URL, chave pública, host do Session pooler e usuário conferidos e preenchidos em `backend/.env.example`. Nenhuma senha do banco foi obtida ou incluída no pacote.

Os advisors retornaram somente avisos informativos: [RLS sem políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), pois o schema é privado e o acesso ocorre pelo servidor Java, e [índices ainda não usados](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), esperado em tabelas recém-criadas e vazias. Não foram criadas políticas públicas para silenciar esses avisos.

## O que ainda depende do ambiente de vocês

Preencha apenas a senha do banco em `backend/.env`, inicie a API e confira `/api/saude`. Se você já copiou o `.env` de um pacote anterior, atualize também `DB_URL` para `jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require`. O arquivo `.env.example` desta versão traz os dados públicos corretos deste projeto.

A lista de URLs autorizadas para recuperação de senha precisa incluir o endereço em `AUTH_REDIRECT_URL`, conforme o README. As ferramentas disponíveis não expõem edição dessa configuração do Auth; confira-a no painel. Não alteramos SMTP, senha do banco ou contas existentes.

Ainda não foram executados login, cadastro, confirmação de e-mail ou recuperação de ponta a ponta no projeto real. Esses fluxos dependem da API Java executando e de contas de teste do grupo. O endpoint público de configuração do Auth foi consultado sem criar contas nem enviar e-mails.

Também é necessário testar visualmente no emulador/celular: exportar o bundle confirma que o código compila, mas não substitui a execução da interface em um dispositivo. Siga o roteiro do README.
