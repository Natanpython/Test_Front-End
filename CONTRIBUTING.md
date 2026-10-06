# Contribuindo

Crie uma branch a partir de `master`, mantenha alterações relacionadas no mesmo commit e abra um pull request. Use títulos e mensagens no padrão Conventional Commits:

```text
feat(users): adiciona filtro por nome
fix(form): rejeita telefone malformado
test(users): cobre cancelamento do modal
docs(readme): explica execução dos testes
ci(actions): adiciona verificação de qualidade
build(docker): configura servidor de produção
chore(deps): atualiza dependências
```

Formato: `tipo(escopo opcional): descrição`. Tipos aceitos incluem `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` e `revert`. Descreva a mudança de forma objetiva; não use mensagens genéricas como “ajustes”.

Para validar a última mensagem localmente após criar o commit:

```bash
npm run commitlint -- --last --verbose
```

Antes do envio, execute `npm run format:check`, `npm run test:coverage`, `npm run build` e os E2E conforme o README. Corrija formatação com `npm run format`.

O GitHub Actions valida todos os commits introduzidos pelo PR e seu título; em pushes, valida a mensagem do último commit. O commit inicial anterior à adoção do padrão não é reescrito. O padrão organiza o histórico; a qualidade do código é verificada separadamente pelos testes, cobertura, compilação e revisão.

## Proteção da branch

Após a primeira execução do workflow, o administrador pode configurar um ruleset para `master` em **Settings → Rules → Rulesets**, exigindo pull request e os checks `Quality`, `Browser tests` e `Container smoke test`, bloqueando force pushes e exclusão da branch. Para um projeto individual, exigir aprovação de outro revisor pode impedir o próprio autor de integrar mudanças.

O arquivo de workflow não ativa proteção de branch por si só. Essa configuração administrativa deve ser confirmada no GitHub. Preferir squash merge e usar o título convencional do PR como mensagem final.

Referências: [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/) e [Commitlint no CI](https://commitlint.js.org/guides/ci-setup.html).
