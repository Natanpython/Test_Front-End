const { chromium, expect } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const results = {};
  try {
    await page.goto('http://127.0.0.1:4300');
    await page.getByText('Giana Sandrini', { exact: true }).waitFor();
    // Delay only the lazy module to reproduce two clicks before it finishes loading.
    await page.route(/user-dialog|chunk-ZFVD6J6E/, async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    await page.locator('.add-user').evaluate(button => { button.click(); button.click(); });
    await page.getByRole('dialog').first().waitFor();
    await page.waitForTimeout(800);
    results.dialogsAfterTwoClicks = await page.getByRole('dialog').count();
    await page.reload();
    await page.getByText('Giana Sandrini', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Adicionar novo usuário', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('E-mail', { exact: true }).fill('review@example.com');
    await dialog.getByLabel('Nome completo', { exact: true }).fill('Revisão');
    await dialog.getByLabel('CPF', { exact: true }).fill('52998224725');
    const phone = dialog.getByLabel('Telefone com DDD', { exact: true });
    results.phoneAccepted = {};
    for (const value of ['++11987654321', '((11987654321', '11987654321']) {
      await phone.fill(value);
      await phone.blur();
      results.phoneAccepted[value] = await dialog.getByRole('button', { name: 'Salvar', exact: true }).isEnabled();
    }
    await dialog.getByLabel('E-mail', { exact: true }).fill('giana@example.com');
    await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    results.duplicateEmailMessage = await dialog.getByRole('alert').innerText();
    results.formPreservedAfterError = await dialog.getByLabel('Nome completo', { exact: true }).inputValue();
    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    results.rowsAfterCancel = await page.locator('.user-card').count();
    results.horizontalOverflow = {};
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      results.horizontalOverflow[width] = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      await page.screenshot({ path: `review/list-${width}.png`, fullPage: true, animations: 'disabled' });
      await page.getByRole('button', { name: 'Adicionar novo usuário', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      results.horizontalOverflow[`dialog-${width}`] = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      await page.screenshot({ path: `review/dialog-${width}.png`, fullPage: true, animations: 'disabled' });
      await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
    require('node:fs').writeFileSync('review/results.json', JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
