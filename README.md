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

## Integração contínua — GitHub Actions

O workflow [CI](.github/workflows/ci.yml) roda em pushes, pull requests e execução manual. Todos os comandos usam a raiz do repositório, sem `working-directory` adicional.

| Job                    | Verificação                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Quality`              | Instalação com `npm ci`, Conventional Commits, formatação, testes com cobertura mínima de 65% e build de produção |
| `Browser tests`        | Instala Chromium e dependências de sistema e executa os E2E de desktop e celular                                  |
| `Container smoke test` | Após os outros jobs passarem, constrói a imagem Docker e verifica HTTP, health check e fallback da aplicação      |

O pipeline usa Node conforme `.nvmrc`, cache de downloads npm, permissões de leitura e cancelamento de execuções antigas da mesma branch/PR. Relatórios de cobertura, resultados do Playwright e build ficam disponíveis como artifacts por sete dias. O Dependabot propõe atualizações de npm, Actions e imagens Docker.

No CI, o Chromium é instalado explicitamente; não depende do Edge da máquina do avaliador. Essa configuração segue a [orientação de CI do Playwright](https://playwright.dev/docs/ci).

Esta estrutura implementa CI e disponibiliza o build como artefato. **Não há deploy automático nem publicação de imagem em registry**: não foi definido um ambiente de hospedagem. Acompanhe as execuções na [aba Actions](https://github.com/Natanpython/Test_Front-End/actions).

## Padrão de commits e contribuição

Use Conventional Commits, por exemplo `fix(form): valida pontuação do telefone` ou `ci(actions): adiciona pipeline de qualidade`. O Commitlint verifica os commits novos e o título nos PRs; em pushes, verifica o último commit. Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para comandos, fluxo de contribuição e instruções de proteção da branch.

```bash
npm run format:check
npm run commitlint -- --last --verbose
```

O primeiro commit histórico precede a adoção dessa convenção. A proteção de `master` com checks obrigatórios depende de configuração administrativa no GitHub; não é ativada apenas pelos arquivos do pipeline.

## Docker — execução opcional de produção

Docker permite avaliar o build de produção sem instalar Node no computador. É necessário ter Docker Engine ou Docker Desktop ativo, com suporte a contêineres Linux.

Na raiz do repositório:

```bash
docker build -t usuarios-app:local .
docker run --rm --name usuarios-app -p 8080:8080 usuarios-app:local
```

Acesse http://localhost:8080. Para parar, use `Ctrl+C` no terminal do contêiner ou `docker stop usuarios-app` em outro terminal.

O [Dockerfile](Dockerfile) usa dois estágios: Node compila o Angular e Nginx sem privilégios de root serve apenas os arquivos gerados na porta 8080. O servidor inclui `/health` e fallback para `index.html`. Esse uso de estágios separa as ferramentas de compilação da imagem final, conforme a [documentação Docker](https://docs.docker.com/build/building/multi-stage/).

O contêiner não adiciona backend ou persistência: os usuários continuam em memória no navegador. Para desenvolvimento com recarga automática, use `npm start`. Docker é opcional para execução local e sua imagem é verificada pelo job `Container smoke test`.

## Roteiro para entender o projeto

1. Comece por `user.model.ts`: é o contrato compartilhado, semelhante aos tipos de props e dados usados em React.
2. Leia `users.service.ts`: concentra o acesso aos dados e pode futuramente ser substituído por chamadas HTTP.
3. Leia `users.store.ts`: Signals guardam/exibem estado, enquanto RxJS organiza tempo, cancelamento e respostas assíncronas.
4. Abra `app.ts` e `app.html` juntos: a classe fornece os valores e ações usados no template.
5. Veja `user-dialog.ts`: o `FormGroup` reúne valores, validações e estado do formulário.
6. Leia os arquivos `.spec.ts`: eles mostram os comportamentos esperados e os casos de falha.

Referências: [Angular](https://angular.dev/overview), [Signals](https://angular.dev/guide/signals), [Reactive Forms](https://angular.dev/guide/forms/reactive-forms), [Angular Material](https://material.angular.dev/), [RxJS](https://rxjs.dev/guide/overview).
