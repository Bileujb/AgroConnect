# AgroConnect — projeto acadêmico

Aplicativo da startup da faculdade para aproximar produtores e consumidores. Este repositório usa **React Native + Expo**, com **backend Java 17 / Spring Boot** e **Supabase Auth + PostgreSQL**. Ele é diferente do exercício anterior feito em Flutter/Firebase.

O visual original foi mantido. Os cadastros, produtos, pedidos e avaliações passaram a usar a API e o banco. O carrinho permanece temporário no celular; pedidos finalizados ficam no banco.

## O que funciona

- Cadastro de produtor e consumidor, login real, confirmação de e-mail conforme configuração do Supabase, sessão salva, renovação de sessão e saída.
- Esqueci minha senha, página para definir nova senha e alteração de senha com a senha atual.
- Meu Perfil: nome, cidade, endereço de entrega ou dados da fazenda. O tipo da conta fica fixo após o cadastro.
- Produtos: cadastrar, editar, remover do catálogo e informar imagem por URL. Cada produtor gerencia apenas seus produtos.
- Catálogo: busca, categorias, estoque, cidade do produtor e média das avaliações.
- Checkout: consulta o preço no banco, confere e baixa estoque, separa pedidos por produtor e evita duplicação ao repetir a mesma solicitação.
- Pedidos do produtor: confirmar, colocar em rota, entregar ou cancelar antes da saída. O consumidor pode cancelar enquanto aguarda confirmação. O cancelamento devolve o estoque uma vez.
- Avaliação: apenas o consumidor do pedido, após a entrega, uma avaliação por pedido.

## 1. Preparar o computador

Instale **Node.js 22.13 ou superior** e **JDK 17 ou superior**. Confira no terminal:

```powershell
node --version
java -version
```

O Android Studio serve para iniciar o emulador. O aplicativo é executado com Expo; não é necessário abrir este projeto como Flutter. Para Android nativo, use um emulador com Expo Go compatível com SDK 57 ou um development build compatível.

## 2. Estrutura no Supabase

**Seu banco já foi configurado:** projeto `mxdbrnzjmtyhxsbndjxm`, região São Paulo. As seis tabelas do schema `agroconnect` foram criadas e verificadas. E-mail/senha está habilitado e a confirmação de e-mail está ativa. A URL e a chave pública do seu projeto já estão preenchidas em `backend/.env.example`.

Para este projeto, não é necessário executar novamente o SQL. As instruções abaixo também permitem reproduzir a estrutura em outro projeto.

1. Abra o seu projeto no painel do Supabase.
2. Entre em **SQL Editor**, crie uma consulta e execute todo o arquivo `supabase/001_estrutura.sql`.
3. As tabelas ficam no schema **agroconnect**. Se o Table Editor não mostrar esse schema, consulte pelo SQL Editor: `select * from agroconnect.usuarios;`.
4. Ative o provedor de **e-mail/senha** em Authentication. Se confirmar e-mail estiver habilitado, abra o e-mail antes de entrar no app. Configure o Site URL para uma página acessível no seu ambiente para finalizar a confirmação.
5. Em Authentication → URL Configuration → Redirect URLs, autorize o endereço da página de recuperação. No mesmo computador: `http://localhost:8080/recuperar-senha.html`. Para abrir o link no celular, use o IP do PC no lugar de localhost e configure esse mesmo endereço em `AUTH_REDIRECT_URL`.

O script cria seis tabelas, índices e RLS. Ele não apaga tabelas existentes e pode ser executado novamente. O schema `agroconnect` fica privado: o app acessa os dados pela API Java. **Não adicione esse schema à lista de schemas públicos da Data API.** A conexão JDBC do servidor usa o usuário `postgres` fornecido no painel Connect; a API verifica quem pode ler e alterar cada registro.

A consulta ao projeto confirmou que não havia tabelas da aplicação em `public` ou `agroconnect` antes desta configuração. Foram criadas somente as tabelas do AgroConnect. Cadastros feitos no antigo login simulado existiam apenas na memória e devem ser criados novamente.

## 3. Configurar e ligar a API Java

Abra um terminal na pasta principal extraída e execute:

```powershell
cd backend
Copy-Item .env.example .env
```

A URL do Auth, a chave pública, o usuário e o host do Session pooler já estão preenchidos no exemplo para este projeto. Após copiá-lo, preencha apenas **DB_PASSWORD** com a senha do banco. Não é necessário redefinir a senha se você já a conhece. Os principais valores são:

```properties
DB_URL=jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
DB_USER=postgres.mxdbrnzjmtyhxsbndjxm
DB_PASSWORD=SUA-SENHA-DO-BANCO
SUPABASE_URL=https://mxdbrnzjmtyhxsbndjxm.supabase.co
PORT=8080
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://localhost:8080
AUTH_REDIRECT_URL=http://localhost:8080/recuperar-senha.html
```

- O host e usuário acima foram conferidos na tela **Connect → Session pooler**, porta **5432**. Mantenha o prefixo `jdbc:` e o parâmetro `sslmode=require`.
- A chave pública `publishable` está no arquivo `.env.example`; mantenha o valor ao copiar para `.env`. Não é necessária uma chave `service_role`.
- O `.env` do backend é lido como arquivo properties: coloque os valores sem aspas. Senhas de banco contendo barra invertida precisam escapá-la como `\\`; alternativamente configure as variáveis diretamente no sistema.
- A senha do banco fica somente no backend. Não copie para o aplicativo e não envie o `.env` ao GitHub.

Para iniciar no Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux/macOS: `./mvnw spring-boot:run`. O wrapper baixa o Maven na primeira execução, por isso precisa de internet. Deixe esse terminal aberto. Teste no navegador: **http://localhost:8080/api/saude**. A resposta esperada é `{"status":"ok","banco":"conectado"}` (a ordem dos campos pode variar).

## 4. Executar o aplicativo no Android

Abra **outro terminal na pasta principal**, sem entrar em `backend`:

```powershell
Copy-Item .env.example .env
npm ci
npm run android
```

Antes, abra o Android Studio → Device Manager e inicie um emulador. Para o emulador padrão do Android Studio, deixe no `.env` da raiz:

```properties
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

Para usar Expo Go em um celular, coloque `http://IP-DO-SEU-PC:8080`, mantenha PC e celular na mesma rede e execute `npm start`. Libere a porta 8080 na rede privada do Windows se necessário. **localhost no celular aponta para o celular, não para o PC.** Reinicie o Expo com `npx expo start --clear` após alterar o `.env`.

Para testar no navegador, use `EXPO_PUBLIC_API_URL=http://localhost:8080` e `npm run web`. Se o Expo escolher outra porta ou você acessar pelo IP, adicione a origem exata em `CORS_ORIGINS` e reinicie a API. O foco da interface é Android; os avisos e confirmações usam `Alert` do React Native.

## 5. Roteiro para apresentar na faculdade

1. Cadastre um produtor com um e-mail seu, confirme o e-mail se solicitado e entre. Para dados fictícios de demonstração, um CNPJ com 14 dígitos é aceito; não há consulta à Receita Federal.
2. Cadastre dois produtos com preço e estoque. Saia da conta.
3. Cadastre um consumidor com outro e-mail, informe endereço e cidade e entre.
4. Adicione os produtos ao carrinho, finalize e veja Meus Pedidos.
5. Entre como produtor e avance o pedido: aguardando → confirmado → em rota → entregue.
6. Entre como consumidor e avalie o pedido entregue.
7. Feche e abra o app: a sessão é recuperada e os dados vêm do banco.
8. Edite Meu Perfil e teste Esqueci minha senha. Serviços de e-mail do Supabase podem exigir SMTP próprio ou limitar destinatários/envios conforme a configuração da conta.

## Estrutura para estudar

| Local | Responsabilidade |
|---|---|
| `src/screens` | Telas e formulários |
| `src/context` | Estado compartilhado e chamadas da API |
| `src/services` | HTTP, sessão e armazenamento seguro no Android |
| `backend/.../AuthController.java` | Cadastro, login e recuperação via Supabase Auth |
| `backend/.../ApiController.java` | Rotas de perfil, produtos, pedidos e avaliações |
| `backend/.../*Service.java` | Regras e consultas SQL |
| `supabase/001_estrutura.sql` | Estrutura do banco |
| `docs/API.md` | Rotas e decisões da implementação |
| `docs/VALIDACAO.md` | Resultado e limites da validação |

As classes de modelos OOP, sensor e notificação mantidas em `src/models` são exemplos acadêmicos do código original. Não representam integração com sensores ou envio de push. Imagens são URLs informadas pelo produtor; não há upload para Storage, pagamento, frete calculado ou rastreamento GPS. A distância entre cidades é uma estimativa local. O carrinho é descartado ao sair/trocar de conta.

## Verificações

```powershell
npm run verificar
npm test
npm run export:android
cd backend
.\mvnw.cmd test
```

Os testes Java usam PostgreSQL temporário e não conectam no seu Supabase. A autenticação externa é simulada nesses testes; o banco e as transações dos pedidos são reais. Execute os testes com um usuário normal do sistema: o PostgreSQL de teste não aceita ser iniciado como root.

## Problemas comuns

- **API não acessível:** deixe o Java ligado, confira `EXPO_PUBLIC_API_URL`, rede e porta 8080.
- **Banco indisponível:** confirme que o projeto Supabase está ativo, execute o SQL, confira a senha e use o Session pooler/5432 com SSL.
- **E-mail não confirmado:** abra o e-mail de confirmação e tente entrar novamente. Confira também spam e as configurações SMTP.
- **Link de recuperação não abre:** `AUTH_REDIRECT_URL` e a lista de redirects do Supabase precisam coincidir, e o navegador deve conseguir alcançar o PC.
- **Cadastro consta no Auth, mas não no schema:** o perfil é criado no primeiro acesso autenticado após a confirmação do e-mail. Uma falha de banco não apaga a conta do Auth; corrija a conexão e entre novamente.
