# AgroConnect

O AgroConnect é o projeto de startup que estamos desenvolvendo na faculdade. A ideia é aproximar produtores rurais de pessoas que querem comprar seus produtos. Fizemos o aplicativo em React Native com Expo e, nesta etapa, conectamos ele a uma API Java (Spring Boot) e ao Supabase.

## O que fizemos

- **Cadastro e login:** produtor e consumidor criam conta e entram com e-mail e senha. O Supabase cuida da autenticação. Se a confirmação por e-mail estiver ativa, é preciso confirmar a conta antes de entrar.
- **Recuperação de senha:** o usuário solicita um e-mail para definir outra senha. Quem está logado também pode trocar a senha.
- **Perfil:** cada pessoa edita seus dados. O produtor informa dados da fazenda; o consumidor, o endereço para entrega.
- **Produtos:** o produtor cadastra, edita e retira produtos do catálogo, com preço, estoque e URL de imagem.
- **Pedidos:** o consumidor monta o carrinho e finaliza a compra. A API confere preço e estoque no banco antes de registrar o pedido. O produtor atualiza o andamento.
- **Avaliações:** depois da entrega, o consumidor pode avaliar o pedido.

Os dados de usuários, produtos, pedidos e avaliações ficam no Supabase. O carrinho fica no celular até a compra ser finalizada.

## Como organizamos o projeto

| Pasta/arquivo | Para que serve |
|---|---|
| `src/screens` | Telas do aplicativo |
| `src/context` e `src/services` | Estado do app, sessão e chamadas da API |
| `backend` | API Java: recebe as solicitações, valida o usuário e acessa o banco |
| `supabase/001_estrutura.sql` | Script das tabelas |
| `docs/API.md` | Resumo das rotas da API |
| `docs/VALIDACAO.md` | Verificações feitas e o que ainda precisamos testar |

O app conversa com a API Java, e a API acessa as tabelas. A senha do banco fica apenas no computador ou servidor que executa o backend.

## Como rodar

Usamos Node.js 22.13 ou superior, JDK 17 ou superior e um emulador iniciado pelo Android Studio. Este aplicativo usa Expo, não Flutter.

### 1. Banco no Supabase

As seis tabelas do nosso projeto já foram criadas no schema `agroconnect`. Não precisamos executar o SQL novamente nesse banco. Para montar a estrutura em outro projeto, execute `supabase/001_estrutura.sql` no SQL Editor e ative a autenticação por e-mail e senha.

As tabelas ficam em um schema privado. O aplicativo acessa os dados pela API Java; não é necessário expor `agroconnect` na Data API. Se o Table Editor não mostrar as tabelas, consulte no SQL Editor:

```sql
select * from agroconnect.usuarios;
```

### 2. Backend Java

Abra um terminal na pasta do projeto e crie o arquivo de configuração local:

```powershell
cd backend
Copy-Item .env.example .env
```

No `backend/.env`, preencha `DB_PASSWORD` com a senha do banco. O exemplo já contém o endereço do nosso projeto Supabase e o usuário do banco. Se usar outro projeto, atualize os demais valores. **Não envie o `.env` ao GitHub.**

Para iniciar:

```powershell
.\mvnw.cmd spring-boot:run
```

Se o Maven Wrapper falhar no Windows, use um Maven instalado: `mvn spring-boot:run`. O Java precisa apontar para um **JDK**, porque o backend é compilado ao iniciar. Deixe esse terminal aberto e acesse `http://localhost:8080/api/saude`. A resposta esperada é `{"status":"ok","banco":"conectado"}`.

### 3. Aplicativo

Inicie o emulador no Android Studio. Abra outro terminal na **pasta principal** do projeto:

```powershell
Copy-Item .env.example .env
npm ci
npm run android
```

No emulador padrão do Android Studio, o `.env` da pasta principal deve conter:

```properties
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

Esse endereço permite que o emulador encontre a API rodando no PC. Para usar um celular na mesma rede, coloque o IP do computador no lugar de `10.0.2.2` e inicie com `npm start`. Depois de alterar o `.env`, reinicie o Expo com `npx expo start --clear`.

## Teste rápido para apresentar

1. Crie uma conta de produtor e confirme o e-mail, se solicitado.
2. Entre como produtor e cadastre dois produtos com preço e estoque.
3. Saia e crie uma conta de consumidor com outro e-mail.
4. Coloque um produto no carrinho e finalize o pedido.
5. Entre como produtor e avance o pedido até entregue.
6. Volte à conta do consumidor e faça uma avaliação.
7. Confira os registros no Supabase e teste a edição do perfil e a recuperação de senha.

Para o link de recuperação funcionar, o endereço de `AUTH_REDIRECT_URL` no `backend/.env` precisa estar permitido em **Authentication → URL Configuration → Redirect URLs** no Supabase. No mesmo PC, usamos `http://localhost:8080/recuperar-senha.html`. Para abrir no celular, configure o IP do PC.

## Limites desta versão

O produtor informa uma URL de imagem; ainda não fizemos upload para o Storage. Também não há pagamento online, cálculo real de frete, rastreamento por GPS nem notificações push. Algumas classes antigas de sensor e notificação continuam em `src/models` como parte dos exercícios da faculdade. Na demonstração, aceitamos CNPJ com 14 dígitos, sem consulta à Receita Federal.

Para conferir o código, usamos `npm run verificar`, `npm test` e os testes Java em `backend`. O roteiro acima ainda precisa ser executado no emulador ou celular com o backend ligado.
