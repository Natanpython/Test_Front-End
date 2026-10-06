# Revisão do desafio — 06/10/2026

> **Atualização após correções:** os dois problemas de código descritos abaixo foram corrigidos. A abertura fica bloqueada desde antes do import até o fechamento do modal, com recuperação após falha. O telefone agora valida a posição dos parênteses, espaço e hífen. Validação atual: **51 testes unitários e 4 testes E2E aprovados**, build de produção aprovado e **99,07% de cobertura de linhas** (93,75% de branches). As seções seguintes e `results.json` registram a revisão inicial, anterior às correções. As pendências de respostas escritas e link público continuam fora destas correções.

**Conclusão:** a aplicação atende aos requisitos obrigatórios verificáveis da seção 4, com ressalva de fidelidade visual. Os fluxos principais passaram nos testes. Foram reproduzidos dois problemas de robustez que merecem correção. A entrega completa ainda não está demonstrada: as respostas das seções 1–3 e o link público do GitHub não foram encontrados nos materiais locais revisados.

Esta revisão não alterou o código da aplicação. A pasta `review` contém relatório, script de diagnóstico, resultados e capturas. Build, cobertura e testes de navegador também regeneraram seus artefatos habituais.

## 1. Achados, por prioridade

### Alta — entrega escrita e repositório público não localizados

O documento pede explicitamente o envio do próprio documento com as perguntas respondidas e o link do código público na conta GitHub. O documento aberto no Word contém as perguntas, mas não foram identificadas respostas. O README reconhece que os exercícios escritos são uma entrega separada. Não há diretório `.git` no projeto ou na raiz desta área de trabalho, nem um link de entrega no README.

Isso não prova que não exista um repositório ou respostas em outro lugar; significa que não foi possível verificar essas entregas aqui. Se ainda não foram preparados, entregar somente a aplicação deixaria parte substancial do desafio sem resposta.

### Média — dois cliques podem abrir dois modais

- Local: `src/app/app.ts`, linhas 55–64.
- O método aguarda o import do formulário sem bloquear outra abertura. Duas chamadas durante o carregamento continuam e executam `dialog.open` separadamente.
- Reprodução no navegador: atrasar o módulo do formulário em 500 ms e disparar dois cliques no botão adicionar antes de ele carregar.
- Resultado observado: **2 elementos com papel `dialog`**. Ao fechar um, o outro permanece, criando formulários independentes e confundindo o fluxo.
- Correção indicada: controlar a abertura desde antes do `await`, manter no máximo um modal e liberar a trava após fechar ou após falha no import. Incluir teste de cliques concorrentes e de falha no carregamento.

### Baixa — validação de telefone aceita pontuação malformada

- Local: `src/app/users/user.validators.ts`, linhas 25–29.
- O validador permite qualquer sequência de parênteses, sinais de mais, espaços e hífens, remove tudo isso e valida apenas os dígitos restantes.
- Com os demais campos válidos, `++11987654321` e `((11987654321` deixam **Salvar habilitado**. A reprodução foi feita na interface.
- Não bloqueia os fluxos obrigatórios, mas enfraquece o diferencial de validação de formato e pode esconder um erro de digitação.
- Correção indicada: definir os formatos aceitos e validar a estrutura antes de normalizar. Preservar aceitação de número nacional sem máscara e de formatos usuais como `(11) 98765-4321`.
- O tipo de telefone também não é confrontado com o número; isso está documentado no README e não é uma obrigação expressa do enunciado.

## 2. Checklist de toda a entrega

| Item do enunciado | Exigência | Situação nos materiais revisados |
|---|---|---|
| Entrega | Documento respondido e link público GitHub | Não localizados; pendência de verificação/entrega |
| Prazo | 4 dias corridos após recebimento | Não verificável sem a data de recebimento |
| 1.1 | Refatorar Produto/Verdureira e explicar melhorias | Resposta não localizada |
| 1.2 | `filtrarEPaginar<T>`, tipos completos, total filtrado e exemplo | Resposta não localizada; a paginação da tela não substitui essa função |
| 2.1 | Corrigir OnPush sem mudar estratégia/serviço nem retirar setInterval | Resposta não localizada |
| 2.2 | Refatorar subscriptions aninhadas, evitar leaks e explicar operador | Resposta não localizada |
| 2.3 | Busca com 500 ms, cancelamento, loading, serviço/componente/template com async pipe | Resposta não localizada; é exercício separado da busca da aplicação |
| 2.4 | Explicar trackBy, OnPush e impacto de Default | Resposta não localizada |
| 3.1 | Carrinho com Signals, computed quantidade × preço, adicionar/remover e output do total | Resposta não localizada |
| 3.2 | Feature To-do NgRx: quatro actions, reducer tipado, dois selectors, effect HTTP com sucesso/erro | Resposta não localizada; usar Signals na aplicação não dispensa esta questão |
| 4 | Aplicação Angular | Detalhada abaixo |

**Distinção importante:** o exercício 2.3 exige **500 ms** e `async pipe`; a aplicação da seção 4 exige **300 ms** e permite Signals. Os 300 ms implementados na aplicação estão corretos. Não há obrigação de converter a aplicação para NgRx, Nx ou async pipe.

## 3. Aplicação: requisitos obrigatórios

| Requisito | Verificação | Resultado |
|---|---|---|
| Angular 17+ | `package.json`: Angular 21 | Atendido |
| Angular Material | Botões, modal, campos, select, spinner e snackbar em uso | Atendido |
| NgRx ou Signals | Estado da listagem, loading, erro, paginação e salvamento com Signals/computed | Atendido |
| RxJS | Serviço e store com Observables e operadores | Atendido |
| Vitest ou Jest | Vitest: 37 testes executados | Atendido |
| Cards com nome, e-mail e editar | Template e testes de tela/navegador | Atendido |
| Filtro por nome com debounce de 300 ms | Timer reiniciado via switchMap; teste temporal automatizado | Atendido |
| Loading durante carregamento | Estado de loading e spinner; testes | Atendido; inclui também a espera do debounce |
| Mensagem de erro ao carregar | catchError, alerta e tentativa novamente; serviço com falha nos testes | Atendido |
| Fonte de dados permitida | Array em serviço com resposta assíncrona simulada | Atendido; backend e persistência não são exigidos |
| Botão vermelho abre cadastro | Abertura testada; E2E verifica cor `rgb(229, 57, 53)` | Atendido, com o problema de cliques concorrentes acima |
| Cadastro e edição em modal | Componente compartilhado; ID preservado na edição | Atendido |
| Reactive Forms | FormGroup tipado e formControlName | Atendido |
| E-mail, nome, CPF e telefone obrigatórios | Validators.required; nome só com espaços rejeitado | Atendido |
| Tipo de telefone | Select Celular/Fixo com valor inicial Celular | Atendido |
| Mensagens por campo | mat-error para os controles | Atendido |
| Salvar desabilitado com formulário inválido | Binding no botão e guarda no método | Atendido |
| Edição preenchida automaticamente | Dados do usuário inicializam os controles | Atendido |
| Dois operadores além de map/tap | switchMap, catchError, startWith e finalize em uso real | Atendido |
| Standalone | Componentes usam imports próprios e compilam sem NgModule | Atendido |
| Subscriptions gerenciadas | takeUntilDestroyed na store, busca, fechamento do modal e salvamento | Atendido na inspeção; destruição da store testada |
| Cobertura acima de 60% | Linhas 99%; branches 93,26%; statements 98,42%; funções 100% | Atendido |
| README com instalação/execução | npm ci, npm start, requisitos de ambiente, build e testes | Atendido documentalmente |

O serviço permite recuperação após falha sem encerrar permanentemente a busca. O cancelamento de uma operação de salvamento antes de sua execução não modifica os dados. Há proteção contra envio duplo no formulário, mas ela não cobre a abertura de múltiplos modais.

## 4. Diferenciais e comparação visual

| Diferencial | Resultado |
|---|---|
| Nx com bibliotecas | Não implementado; opcional |
| Paginação | Implementada, seis usuários por página; avanço e limite testados unitariamente |
| Formato de e-mail | Validador presente |
| CPF | Formato, repetição de dígitos e verificadores testados |
| Telefone | Regra de dígitos presente; ressalva de pontuação descrita acima |
| Melhorias de interface | Estado vazio, limpar busca, retry, snackbar, cancelar, responsividade e labels acessíveis |

As imagens foram extraídas do documento aberto no Word sem editar o original (`image1.png` e `image2.png`). A implementação mantém barra cinza, busca, listagem com dados e edição, botão vermelho flutuante e modal com os campos pedidos.

Há diferenças visíveis: marca `a.` no lugar do menu, título maior, subtítulo e contador, avatar com inicial, cards mais altos e arredondados, campos com contorno, modal mais alto e arredondado. No protótipo, CPF, telefone e tipo ficam na mesma linha; no projeto, CPF ocupa uma linha separada. O botão Salvar muda de alinhamento e há botão Cancelar.

O texto do protótipo sobre senha provisória por SMS foi omitido. Não há requisito textual para implementar autenticação ou envio de SMS, e o README explica esse limite do mock. Não classifiquei SMS como funcionalidade faltante.

Como melhorias são expressamente aceitas, as diferenças visuais não demonstram descumprimento funcional. Ainda assim, o resultado não é uma reprodução exata do protótipo, e a preferência do avaliador por maior fidelidade não pode ser garantida.

## 5. Verificações executadas

- `npm.cmd run build`: passou, sem erro ou aviso de budget; pacote inicial de 430,26 kB, estimativa de transferência de 100,50 kB. Modal carregado em chunk separado.
- `npm.cmd run test:coverage`: 5 arquivos e **37 testes aprovados**.
- Cobertura: **98,42% statements; 93,26% branches; 100% funções; 99% linhas**. São métricas do escopo configurado: configuração de providers, interfaces, entrypoint e arquivos de testes não entram. O LCOV inclui App, UserDialog, validators, UsersService e UsersStore.
- `E2E_CHANNEL=msedge npm.cmd run test:e2e`: **2 testes aprovados**, em desktop e viewport móvel; busca, vazio, cadastro, edição, cor do botão, erros de página e overflow.
- `node review/probe.cjs`: confirmou os dois problemas, mensagem de e-mail duplicado, preservação do formulário após erro e cancelamento sem criar usuário.
- Listagem e modal sem overflow horizontal nas larguras **320, 390 e 1280 px**. Capturas em `review/list-*.png` e `review/dialog-*.png`.
- Inspeção visual das capturas de desktop e do modal de 320 px: conteúdo legível e ações presentes.

As primeiras execuções de build/testes dentro do ambiente restrito falharam por acesso negado do compilador. As execuções com acesso autorizado passaram. Isso foi uma limitação do ambiente de revisão, não uma falha de compilação do código. O ensaio E2E restrito também não é usado como evidência de funcionamento.

## 6. Limites e próximos ajustes

Não foi feita uma instalação limpa com `npm ci`; build e testes usaram as dependências já instaladas. Os testes de navegador usaram Edge/Chromium, inclusive em viewport móvel, e não comprovam funcionamento em Safari real, Firefox ou aparelho físico. A revisão de acessibilidade foi estrutural e visual, sem auditoria completa com leitor de tela. Cobertura alta não substitui cenários de teste: ambos os problemas reproduzidos escaparam dos testes existentes.

Antes da entrega, as prioridades são: localizar/concluir as respostas e o link público, impedir abertura concorrente de modais e tornar a validação de pontuação de telefone consistente. Aproximar o visual do protótipo é uma decisão de apresentação; Nx, backend, persistência, exclusão de usuários e SMS não são exigências da aplicação.

Para repetir o diagnóstico, iniciar `npm.cmd run start -- --host 127.0.0.1 --port 4300` na pasta do projeto e executar `node review/probe.cjs`, com Edge instalado. O script apenas interage com os dados em memória e grava evidências nesta pasta; não é parte da aplicação nem da suíte oficial.
