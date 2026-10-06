# Gestão de usuários — desafio Angular

Aplicação de listagem, cadastro e edição de usuários, baseada no protótipo do desafio. Angular 21, Angular Material, Signals, RxJS e Reactive Forms. Componentes standalone com `OnPush` e TypeScript em modo estrito.

## Executar localmente

Pré-requisitos: Node.js 24 LTS e npm. Ambiente validado com Node 24.14.0 e npm 11.9.0.

Clone o repositório e entre na raiz do projeto:

```bash
git clone https://github.com/Natanpython/Test_Front-End.git
cd Test_Front-End
```

O `package.json`, este README e a pasta `src` ficam diretamente nessa raiz. Não há uma subpasta `usuarios-app` para acessar no repositório clonado. Se já estiver na pasta que contém o `package.json`, execute os comandos a partir dela, independentemente do nome da sua pasta local.

Instale as dependências e inicie a aplicação:

```bash
npm ci
npm start
```

Acesse http://localhost:4200. No Windows, se o PowerShell bloquear `npm.ps1`, use `npm.cmd ci` e `npm.cmd start`.

```bash
npm run build          # produção em dist/usuarios-app/browser
npm test              # testes unitários
npm run test:coverage  # testes sem watch e relatório de cobertura
```

O relatório HTML fica em `coverage/usuarios-app/index.html`. A configuração exige pelo menos 65% em linhas, funções, instruções e branches, acima dos 60% pedidos. Entrypoint, configuração de providers e interfaces sem comportamento não entram na cobertura.

Os testes unitários não precisam de navegador instalado nem de `npm start` em outro terminal. No Windows, o comando equivalente é `npm.cmd run test:coverage`.

## Funcionalidades

- Busca por nome com debounce de 300 ms, ignorando acentos e maiúsculas.
- Cancelamento imediato da consulta anterior ao alterar a busca.
- Loading, estado vazio, tratamento de erro e botão para tentar novamente.
- Cadastro e edição no mesmo modal, com dados preenchidos na edição.
- E-mail e nome obrigatórios; CPF com verificação dos dígitos; telefone brasileiro com DDD.
- Tipo de telefone com valor inicial Celular; opção Fixo.
- Bloqueio de envio inválido ou duplicado, feedback de sucesso e erro de e-mail duplicado.
- Paginação local de seis usuários, layout responsivo e controles com nomes acessíveis.
- Modal carregado sob demanda para reduzir o pacote inicial.
- Proteção contra abertura de modais duplicados durante o carregamento e enquanto o formulário estiver aberto.

## Dados e limites do mock

`UsersService` mantém um array em memória e simula uma resposta após 400 ms usando RxJS. Os três registros iniciais são demonstrativos. Recarregar a página reinicia os dados; não há backend, autenticação ou envio de SMS. Essa opção é permitida pelo enunciado.

A listagem não produz falhas aleatórias. Seu tratamento de erro e recuperação é verificado em testes com um serviço que retorna erro. Para ver um erro de salvamento na interface, tente cadastrar um novo usuário com `giana@example.com`.

Exemplo para experimentar o formulário: CPF `529.982.247-25` e telefone `(11) 98765-4321`. Use dados fictícios. A validação de CPF verifica formato e dígitos, não identidade ou existência na Receita Federal. O telefone aceita formato nacional, com ou sem pontuação, e não valida a existência da linha. O tipo selecionado não impõe validação cruzada com o número.

## Organização e decisões

```text
src/app/
  app.ts / app.html / app.scss  # listagem, busca, paginação e abertura do modal
  users/
    user.model.ts              # contrato tipado de usuário
    users.service.ts           # dados mockados e operações de leitura/escrita
    users.store.ts             # estado da listagem em Signals
    user-dialog.*              # formulário reativo de criação/edição
    user.validators.ts         # regras de CPF, telefone e nome
```

O serviço fornece Observables; a store coordena as buscas e expõe Signals somente de leitura à tela. `computed` calcula a página atual e os registros visíveis. `@for` acompanha cada usuário por seu ID.

O debounce é implementado com `switchMap` e `timer(300)`: cada termo cancela imediatamente o timer ou a consulta anterior. A recarga inicial e o refresh após salvar usam `timer(0)`. `catchError` fica dentro do fluxo de cada busca, permitindo novas tentativas depois de falhas. `takeUntilDestroyed` encerra subscriptions com o componente; `finalize` restaura o formulário após salvar ou falhar. O loading inclui a espera do debounce.

Signals foi escolhido para o escopo pequeno da tela. Nx e NgRx não são necessários para esta aplicação. O exercício específico de NgRx solicitado na parte escrita do desafio é uma entrega separada, assim como as demais questões do documento.

## Testes de navegador (opcional)

Após `npm ci`, escolha **uma** das opções abaixo. O comando `npm run test:e2e` usa o Chromium do Playwright por padrão. Instalar as dependências npm não substitui a instalação desse navegador.

### Opção 1 — Chromium do Playwright

Instale o navegador na primeira execução e novamente se uma atualização do Playwright solicitar uma nova versão:

```bash
npx playwright install chromium
npm run test:e2e
```

No PowerShell, caso scripts `.ps1` sejam bloqueados:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Essa opção não exige Edge. Os comandos pressupõem que `E2E_CHANNEL` não esteja definido no terminal.

### Opção 2 — Microsoft Edge já instalado (Windows)

Esta foi a opção usada na validação local. Não é necessário baixar o Chromium do Playwright, mas o Microsoft Edge precisa estar instalado.

**Git Bash:** copie a linha completa, incluindo `E2E_CHANNEL=msedge`:

```bash
E2E_CHANNEL=msedge npm.cmd run test:e2e
```

O prefixo vale apenas para essa execução. Para selecionar o Edge durante toda a sessão atual do Git Bash:

```bash
export E2E_CHANNEL=msedge
npm.cmd run test:e2e
```

**PowerShell:**

```powershell
$env:E2E_CHANNEL = 'msedge'
npm.cmd run test:e2e
```

No PowerShell, a variável também permanece na sessão atual. Ao abrir um novo terminal, selecione o Edge novamente. Não misture a sintaxe de variáveis do PowerShell com a do Git Bash.

Para voltar ao Chromium padrão na mesma sessão, execute `unset E2E_CHANNEL` no Git Bash ou `Remove-Item Env:E2E_CHANNEL -ErrorAction SilentlyContinue` no PowerShell e instale o Chromium conforme a opção 1.

### O que os testes executam

Os testes iniciam o servidor automaticamente e percorrem busca, estado vazio, cadastro e edição em desktop e celular. Também verificam erros de execução, cor do botão de cadastro e overflow horizontal. Screenshots ficam em `test-results/`.

Os testes também verificam cliques concorrentes na abertura do modal, reabertura após cancelar e rejeição de telefones com pontuação malformada. O telefone aceita números nacionais sem máscara ou com DDD entre parênteses, um espaço opcional após o DDD e hífen opcional antes dos quatro últimos dígitos.

Não é necessário executar `npm start` antes dos E2E. A configuração usa `http://127.0.0.1:4200` e pode reutilizar um servidor já disponível nessa URL fora de CI; se houver um servidor nessa porta, certifique-se de que pertence a este projeto. O cenário móvel usa emulação no mesmo navegador, não um aparelho físico ou Safari.

### Solução de problemas

| Mensagem/situação                                                                 | Causa e solução                                                                                                                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ENOENT` / `Could not read package.json`                                          | O terminal está fora da pasta do projeto. Entre na pasta que contém `package.json` antes de executar os comandos.                                                                                 |
| `Executable doesn't exist` com caminho `ms-playwright/chromium_headless_shell...` | O navegador exigido pelo Playwright não está instalado. Execute `npx playwright install chromium` ou selecione o Edge conforme a opção 2. Os cenários da aplicação ainda não chegaram a executar. |
| O erro do Chromium voltou depois de uma execução bem-sucedida com Edge            | O comando foi executado sem a seleção do Edge. No Git Bash, repita a linha completa com `E2E_CHANNEL=msedge` ou use `export` na sessão atual.                                                     |
| PowerShell bloqueia `npm.ps1` ou `npx.ps1`                                        | Use `npm.cmd` e `npx.cmd` nos comandos correspondentes.                                                                                                                                           |

### Última verificação local — 06/10/2026

- Build de produção aprovado: `npm.cmd run build`.
- **51 testes unitários aprovados**; cobertura de linhas **99,07%** e branches **93,75%**.
- **4 testes E2E aprovados** com Edge, cobrindo os cenários de desktop e celular.

Esses números registram a versão verificada; a saída dos comandos mostra o resultado da execução no ambiente do avaliador.

## CI/CD — GitHub Actions e publicação da imagem

O projeto está preparado para compilar e rodar como um contêiner Linux em um servidor com Docker. A pipeline automatiza as verificações e, quando elas passam em um push para `master`, publica a imagem no GitHub Container Registry (GHCR). O deploy no servidor é feito com Docker Compose: o workflow não acessa nem altera um servidor externo.

### Fluxo da pipeline

1. **Pull request ou push:** o workflow [CI](.github/workflows/ci.yml) instala dependências com `npm ci`, verifica Conventional Commits e formatação, executa testes unitários com cobertura e testes de navegador, e compila a aplicação.
2. **Verificação do contêiner:** depois de `Quality` e `Browser tests` passarem, o job `Container smoke test` constrói a imagem e verifica `/health`, a página inicial e o fallback de rotas do Angular.
3. **Publicação após CI aprovado:** em push para `master`, o workflow [Publish container](.github/workflows/publish-container.yml) aguarda o CI concluir com sucesso, então constrói e envia a imagem para `ghcr.io/natanpython/test_front-end`.

| Imagem publicada | Uso |
| --- | --- |
| `ghcr.io/natanpython/test_front-end:latest` | versão mais recente aprovada em `master` |
| `ghcr.io/natanpython/test_front-end:sha-<commit>` | versão identificada pelo commit, recomendada para deploy reproduzível |

A pipeline também roda manualmente para validação, mas a publicação é exclusiva de pushes aprovados em `master`. Ela usa o `GITHUB_TOKEN` com permissões mínimas, sem armazenar senha de registry no repositório. Artefatos de cobertura, Playwright e build ficam disponíveis por sete dias. O Dependabot acompanha dependências npm, Actions e imagens Docker. Acompanhe as execuções na [aba Actions](https://github.com/Natanpython/Test_Front-End/actions).

O pacote GHCR pode ficar privado inicialmente. Para que um servidor baixe a imagem sem credenciais, ajuste a visibilidade do pacote para pública na página **Packages** do GitHub. Se o pacote permanecer privado, autentique o servidor no GHCR com um token de leitura de pacotes; não coloque esse token no `.env` nem no repositório.

### Commits e proteção da branch

Use Conventional Commits, por exemplo `fix(form): valida pontuação do telefone` ou `ci(actions): adiciona pipeline de qualidade`. O Commitlint verifica commits novos e títulos de PR; em pushes, verifica o último commit. Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para comandos e fluxo de contribuição. Para conferir localmente, execute `npm run format:check` e `npm run commitlint -- --last --verbose`.

O primeiro commit histórico precede a adoção dessa convenção; os commits novos devem seguir o padrão.

A proteção de `master` com checks obrigatórios precisa ser ativada nas configurações do GitHub. Depois de uma execução bem-sucedida, configure as regras da branch para exigir os jobs `Quality`, `Browser tests` e `Container smoke test` antes do merge. Os arquivos do workflow, sozinhos, não ativam essa proteção.

## Docker, Nginx e hospedagem

### O que está preparado

O [Dockerfile](Dockerfile) faz build em múltiplos estágios: Node compila o Angular e a imagem final usa Nginx sem privilégios de root, servindo apenas os arquivos de produção na porta `8080`. A configuração [docker/default.conf](docker/default.conf) atende rotas da SPA com fallback para `index.html` e expõe `/health`, usado pelo Docker, Compose e CI. Não é necessário instalar Node no servidor.

O contêiner serve apenas o frontend. Os usuários de demonstração continuam em memória no navegador; não há backend, persistência, autenticação ou envio de SMS. Para desenvolvimento com recarga automática, continue usando `npm start`.

### Executar localmente com Docker Compose

É necessário ter Docker Engine ou Docker Desktop ativo, com suporte a contêineres Linux. Na raiz do repositório, copie o exemplo de configuração e suba o build local:

```bash
cp .env.example .env
docker compose up --build
```

No PowerShell, o comando de cópia equivalente é `Copy-Item .env.example .env`. Acesse http://localhost:8080; `HOST_PORT` no `.env` permite escolher outra porta disponível. Encerre com `docker compose down`. Esse fluxo compila a imagem a partir do código local.

### Executar a imagem em um servidor

O servidor precisa ter Docker Engine e o plugin Docker Compose instalados, além de uma porta liberada no firewall. Depois de um push aprovado em `master`, prepare a configuração e inicie a imagem publicada:

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

O Compose de produção usa `IMAGE_NAME` e `HOST_PORT` do `.env`. A configuração de exemplo aponta para a tag `latest`; para fixar uma versão exata, altere `IMAGE_NAME` para `ghcr.io/natanpython/test_front-end:sha-<commit>`. Se o pacote for privado, faça login no GHCR no servidor antes do `pull`, usando um token com permissão de leitura de pacotes.

Para atualizar, faça `pull` e depois `up -d` novamente. Consulte os logs com `docker compose -f docker-compose.prod.yml logs -f` e pare o serviço com `docker compose -f docker-compose.prod.yml down`. O health check pode ser conferido com `docker compose -f docker-compose.prod.yml ps`.

Para servir por um domínio com HTTPS, configure DNS e coloque um proxy reverso ou balanceador com TLS à frente do contêiner, encaminhando para a porta `HOST_PORT`. Domínio, certificado TLS, firewall e máquina de hospedagem são dados do ambiente real e ainda precisam ser configurados pelo responsável pelo servidor. A pipeline publica a imagem; não configura esses recursos nem faz deploy remoto.

## Roteiro para entender o projeto

1. Comece por `user.model.ts`: é o contrato compartilhado, semelhante aos tipos de props e dados usados em React.
2. Leia `users.service.ts`: concentra o acesso aos dados e pode futuramente ser substituído por chamadas HTTP.
3. Leia `users.store.ts`: Signals guardam/exibem estado, enquanto RxJS organiza tempo, cancelamento e respostas assíncronas.
4. Abra `app.ts` e `app.html` juntos: a classe fornece os valores e ações usados no template.
5. Veja `user-dialog.ts`: o `FormGroup` reúne valores, validações e estado do formulário.
6. Leia os arquivos `.spec.ts`: eles mostram os comportamentos esperados e os casos de falha.

Referências: [Angular](https://angular.dev/overview), [Signals](https://angular.dev/guide/signals), [Reactive Forms](https://angular.dev/guide/forms/reactive-forms), [Angular Material](https://material.angular.dev/), [RxJS](https://rxjs.dev/guide/overview).
