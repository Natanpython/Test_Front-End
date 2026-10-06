import { expect, test } from '@playwright/test';

test('busca, cadastra e edita usuário sem erros de página ou overflow', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('Giana Sandrini', { exact: true })).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Pesquisar usuários por nome' });
  await search.fill('joao');
  await expect(page.locator('.user-card')).toHaveCount(1);
  await expect(page.getByText('João Oliveira', { exact: true })).toBeVisible();
  await search.fill('não existe');
  await expect(page.getByText('Nenhum usuário encontrado')).toBeVisible();
  await page.getByRole('button', { name: 'Limpar busca' }).click();
  await expect(page.locator('.user-card')).toHaveCount(3);
  const add = page.getByRole('button', { name: 'Adicionar novo usuário', exact: true });
  await expect(add).toHaveCSS('background-color', 'rgb(229, 57, 53)');
  await page.screenshot({ path: testInfo.outputPath('listagem.png'), fullPage: true });
  await add.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Salvar', exact: true })).toBeDisabled();
  await dialog.getByLabel('E-mail', { exact: true }).fill('ana@example.com');
  await dialog.getByLabel('Nome completo', { exact: true }).fill('Ana Silva');
  await dialog.getByLabel('CPF', { exact: true }).fill('529.982.247-25');
  for (const invalidPhone of ['++11987654321', '((11987654321']) {
    await dialog.getByLabel('Telefone com DDD', { exact: true }).fill(invalidPhone);
    await dialog.getByLabel('Telefone com DDD', { exact: true }).blur();
    await expect(dialog.getByText('Informe um telefone válido com DDD.')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Salvar', exact: true })).toBeDisabled();
  }
  await dialog.getByLabel('Telefone com DDD', { exact: true }).fill('(11) 98765-4321');
  await page.screenshot({ path: testInfo.outputPath('cadastro.png'), fullPage: true });
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Ana Silva', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar Ana Silva', exact: true }).click();
  await expect(dialog.getByLabel('Nome completo', { exact: true })).toHaveValue('Ana Silva');
  await dialog.getByLabel('Nome completo', { exact: true }).fill('Ana Souza');
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Ana Souza', { exact: true })).toBeVisible();
  await expect(page.locator('.user-card')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('abre apenas um modal com cliques durante o carregamento e permite reabrir', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Giana Sandrini', { exact: true })).toBeVisible();
  await page.route(/\.js(?:\?|$)/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });
  const add = page.getByRole('button', { name: 'Adicionar novo usuário', exact: true });
  await add.evaluate((button) => {
    button.click();
    button.click();
  });
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await add.click();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
