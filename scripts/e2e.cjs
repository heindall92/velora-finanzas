/**
 * End-to-end check + screenshots, phone and desktop, light and dark.
 *
 *   npm run build && npx vite preview --port 4173 --strictPort &
 *   npm run e2e                         # BASE_URL defaults to http://localhost:4173/velora-finanzas/
 *
 * Uses the system Playwright (require('playwright')). Screenshots land in docs/screenshots/.
 * Fails (exit 1) on any assertion, console error, CSP violation or horizontal overflow.
 */
const { chromium, devices } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');

const BASE = process.env.BASE_URL || 'http://localhost:4173/velora-finanzas/';
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const IOS_CHROME_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1';

const profiles = {
  // iPhone 15 Pro metrics; Chromium engine emulating Safari's UA and viewport.
  iphone: { ...devices['iPhone 15 Pro'], locale: 'pt-BR' },
  iphoneChrome: { ...devices['iPhone 15 Pro'], userAgent: IOS_CHROME_UA, locale: 'pt-BR' },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'pt-BR' },
};

const problems = [];

async function newPage(browser, profile, { dark = false } = {}) {
  const ctx = await browser.newContext({ ...profiles[profile], colorScheme: dark ? 'dark' : 'light' });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`[${profile}] console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[${profile}] pageerror: ${e.message}`));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`));
  });
  return { ctx, page };
}

/**
 * Mobile browsers WIDEN the layout viewport when content overflows, so scrollWidth vs innerWidth
 * can both read 525 on a 393px phone and look fine. Compare against the device width instead.
 */
async function noOverflow(page, label) {
  const { sw, iw, dw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
    dw: window.screen.width,
  }));
  const limit = Math.min(iw, dw);
  if (sw > limit + 1 || iw > dw + 1) problems.push(`${label}: horizontal overflow (scroll ${sw}, viewport ${iw}, device ${dw})`);
}

/** The currency symbol must never overlap the digits (the v1 bug), in any currency. */
async function moneyFieldsClear(page, label) {
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll('.money-field')]
      .filter((f) => f.getClientRects().length)
      .map((f) => {
        const s = f.querySelector('span').getBoundingClientRect();
        const i = f.querySelector('input').getBoundingClientRect();
        return s.right <= i.left + 0.5 ? null : `${f.querySelector('span').textContent} overlaps by ${(s.right - i.left).toFixed(1)}px`;
      })
      .filter(Boolean),
  );
  if (bad.length) problems.push(`${label}: ${bad.join(', ')}`);
}

async function shot(page, name, full = true) {
  await page.waitForTimeout(450); // let sheets / ticks settle
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
}

async function onboard(page, { budget = '3.000', bank = 'Nubank', start = '4.250,90' } = {}) {
  await page.goto(BASE);
  await page.getByRole('heading', { name: /Vamos organizar/ }).first().waitFor();
  await page.getByLabel('Nome', { exact: true }).fill('Ana');
  await page.getByLabel('Sobrenome').fill('Souza');
  await page.getByLabel(/Orçamento mensal/).fill(budget);
  if (bank) {
    await page.getByRole('radio', { name: bank, exact: true }).click();
    await page.getByLabel('Saldo atual nesse banco').fill(start);
  }
  await page.getByRole('button', { name: 'Começar' }).click();
  await page.getByRole('heading', { name: 'Olá, Ana' }).waitFor();
}

async function addEntry(page, { type = 'Gasto', amount, category, note, date, account, from, to }) {
  await page.getByRole('button', { name: 'Novo lançamento' }).first().click();
  const dlg = page.locator('dialog[open]');
  await dlg.waitFor();
  if (type !== 'Gasto') await dlg.getByRole('button', { name: type, exact: true }).click();
  await dlg.getByLabel('Valor').fill(amount);
  if (account) await dlg.getByRole('radiogroup', { name: 'Conta' }).getByRole('radio', { name: account, exact: true }).click();
  if (from) await dlg.getByRole('radiogroup', { name: 'De' }).getByRole('radio', { name: from, exact: true }).click();
  if (to) await dlg.getByRole('radiogroup', { name: 'Para' }).getByRole('radio', { name: to, exact: true }).click();
  if (category) await dlg.getByRole('radio', { name: category }).click();
  if (note) await dlg.getByLabel('Nota').fill(note);
  if (date) await dlg.getByLabel('Data').fill(date);
  await dlg.getByRole('button', { name: 'Salvar' }).click();
  await dlg.waitFor({ state: 'hidden' });
}

function dayKey(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function addAccount(page, { bank, kind, opening }) {
  await page.getByRole('button', { name: 'Adicionar conta' }).first().click();
  const dlg = page.locator('dialog[open]');
  await dlg.waitFor();
  await dlg.getByRole('radio', { name: bank, exact: true }).click();
  if (kind) await dlg.getByRole('radio', { name: kind, exact: true }).click();
  await dlg.getByLabel(/Saldo atual|Fatura atual/).fill(opening);
  await dlg.getByRole('button', { name: 'Salvar' }).click();
  await dlg.waitFor({ state: 'hidden' });
}

/*
 * Fixture with answers computed by hand BEFORE looking at the UI (dashboard-design: known totals).
 * Openings: Nubank 4.250,90 · Cartão Nubank −850 (bill) · Inter 1.000 · Carteira 120
 * After the entries below and paying the 850 bill from Nubank:
 *   Nubank 1.550,90 · Cartão Nubank −495,77 · Inter 1.964,10 · Carteira 81,10
 *   Total 3.100,33 = assets 3.596,10 − liabilities 495,77
 * Spending by bank this month: Nubank 1.850 · Cartão 495,77 · Inter 235,90 · Carteira 38,90
 * (the flow then edits Padaria 38,90 → 40,00: Carteira 80,00 / spent 40,00, total 3.099,23, assets 3.595,00)
 */
async function seed(page) {
  const entries = [
    { amount: '412,37', category: 'Mercado', note: 'Pão de Açúcar', date: dayKey(0), account: 'Cartão Nubank' },
    { amount: '38,90', category: 'Café e lanches', note: 'Padaria', date: dayKey(0), account: 'Carteira' },
    { amount: '27,50', category: 'Uber / 99', date: dayKey(-1), account: 'Cartão Nubank' },
    { amount: '1.850', category: 'Moradia', note: 'Aluguel', date: dayKey(-3), account: 'Nubank' },
    { amount: '89,90', category: 'Celular e internet', note: 'Vivo Fibra', date: dayKey(-4), account: 'Inter' },
    { amount: '55,90', category: 'Assinaturas', note: 'Netflix + Spotify', date: dayKey(-6), account: 'Cartão Nubank' },
    { amount: '146', category: 'Restaurantes', note: 'Jantar', date: dayKey(-8), account: 'Inter' },
    { type: 'Entrada', amount: '1.200', category: 'Freela', note: 'Site cliente', date: dayKey(-2), account: 'Inter' },
    { type: 'Transferência', amount: '850', note: 'Fatura', date: dayKey(0), from: 'Nubank', to: 'Cartão Nubank' },
  ];
  for (const e of entries) await addEntry(page, e);
}

(async () => {
  const browser = await chromium.launch();

  // ── iPhone (Safari UA): full flow ───────────────────────────────────────
  {
    const { ctx, page } = await newPage(browser, 'iphone');
    await page.goto(BASE);
    await shot(page, 'iphone-onboarding', false);
    await onboard(page);

    // The bank picked at onboarding is the first account; R$ formatted the Brazilian way.
    assert.ok(await page.getByText('R$ 4.250,90').first().isVisible(), 'starting balance shown as R$ 4.250,90');
    assert.equal(await page.getByText('Pão de Açúcar').count(), 0, 'no demo data');
    await page.getByText('Instale o app').first().waitFor(); // iOS install banner
    await shot(page, 'iphone-home-empty');

    await page.getByRole('button', { name: 'Como instalar' }).click();
    await page.getByText('Toque em Compartilhar na barra inferior do Safari').waitFor();
    await shot(page, 'iphone-install-safari', false);
    await page.getByRole('button', { name: 'Fechar' }).click();

    // Accounts: a credit card with an open bill, another bank, cash.
    await addAccount(page, { bank: 'Nubank', kind: 'Cartão de crédito', opening: '850' });
    await addAccount(page, { bank: 'Inter', opening: '1.000' });
    await addAccount(page, { bank: 'Carteira', opening: '120' });
    await seed(page);
    await page.getByText('R$ 3.100,33').first().waitFor();
    await noOverflow(page, 'iphone home');
    await page.getByRole('button', { name: 'Agora não' }).click();
    await shot(page, 'iphone-home');

    // Edit an entry, then delete it and undo.
    await page.getByRole('button', { name: /Padaria/ }).first().click();
    const dlg = page.locator('dialog[open]');
    await dlg.getByLabel('Valor').fill('40');
    await dlg.getByRole('button', { name: 'Salvar' }).click();
    await page.getByText('Lançamento atualizado').waitFor();
    await page.getByRole('button', { name: /Padaria/ }).first().click();
    await dlg.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await page.getByRole('button', { name: /Padaria/ }).first().waitFor();

    // New entry sheet screenshot.
    await page.getByRole('button', { name: 'Novo lançamento' }).first().click();
    await page.locator('dialog[open]').getByLabel('Valor').fill('25,90');
    await shot(page, 'iphone-new-entry', false);
    await page.getByRole('button', { name: 'Fechar' }).click();

    await page.getByRole('navigation').getByRole('link', { name: 'Extrato' }).first().click();
    await page.getByPlaceholder(/Buscar/).fill('aluguel');
    await page.getByRole('button', { name: /Aluguel/ }).waitFor();
    await page.getByPlaceholder(/Buscar/).fill('');
    await noOverflow(page, 'iphone activity');
    await shot(page, 'iphone-activity');

    // Statement filtered by bank (native select).
    await page.locator('select').selectOption({ label: 'Cartão Nubank' });
    await page.getByRole('button', { name: /Pão de Açúcar/ }).waitFor();
    assert.equal(await page.getByRole('button', { name: /Aluguel/ }).count(), 0, 'filter hides other banks');
    await page.locator('select').selectOption({ label: 'Todas as contas' });

    // Gastos: donut by category, by bank, limits.
    await page.getByRole('navigation').getByRole('link', { name: 'Gastos' }).first().click();
    await page.getByText('Total de gastos').waitFor();
    await page.getByText('R$ 2.621,67').first().waitFor(); // Padaria was edited to 40,00 above
    await noOverflow(page, 'iphone spending');
    await shot(page, 'iphone-spending');
    await page.getByRole('button', { name: 'Banco', exact: true }).click();
    await page.getByText('Gastos por banco').waitFor();
    for (const v of ['R$ 1.850,00', 'R$ 495,77', 'R$ 235,90', 'R$ 40,00']) await page.getByText(v).first().waitFor();
    await shot(page, 'iphone-spending-bank', false);
    await page.getByRole('button', { name: /^Mercado/ }).click();
    await page.locator('dialog[open]').getByLabel('Definir limite').fill('500');
    await page.locator('dialog[open]').getByRole('button', { name: 'Salvar' }).click();
    await page.getByText('restam R$ 87,63').waitFor();
    await page.getByRole('button', { name: 'Ver entradas' }).click();
    await page.getByText('Total de entradas').waitFor();
    await page.getByRole('button', { name: 'Ver gastos' }).click();

    // Contas / Patrimônio.
    await page.getByRole('navigation').getByRole('link', { name: 'Contas' }).first().click();
    await page.getByRole('heading', { name: /Patrimônio/ }).waitFor();
    for (const v of ['R$ 3.099,23', 'R$ 3.595,00', 'R$ 495,77', 'R$ 1.550,90', 'R$ 1.964,10', 'R$ 80,00']) await page.getByText(v).first().waitFor();
    await noOverflow(page, 'iphone accounts');
    await shot(page, 'iphone-accounts');
    await page.getByRole('button', { name: 'Passivos' }).click();
    await page.getByText('Minhas dívidas').waitFor();
    await shot(page, 'iphone-accounts-liabilities', false);
    await page.getByRole('button', { name: 'Ativos' }).click();

    await page.getByRole('link', { name: /^Metas/ }).click();
    await page.getByRole('button', { name: 'Criar meta' }).click();
    let g = page.locator('dialog[open]');
    await g.getByLabel('Nome', { exact: true }).fill('Reserva de emergência');
    await g.getByLabel('Quanto quer juntar').fill('10.000');
    await g.getByLabel('Já guardado').fill('3.200');
    await g.getByLabel(/Prazo/).fill(`${new Date().getFullYear() + 1}-06-30`);
    await g.getByRole('button', { name: 'Salvar' }).click();
    await page.getByRole('button', { name: 'Nova meta' }).click();
    g = page.locator('dialog[open]');
    await g.getByLabel('Nome', { exact: true }).fill('Viagem Floripa');
    await g.getByRole('radio', { name: 'plane' }).click();
    await g.getByLabel('Quanto quer juntar').fill('2.500');
    await g.getByLabel('Já guardado').fill('2.500');
    await g.getByRole('button', { name: 'Salvar' }).click();
    await page.getByRole('button', { name: 'Guardar' }).first().click();
    await page.locator('dialog[open]').getByLabel('Valor').fill('300');
    await page.locator('dialog[open]').getByRole('button', { name: 'Guardar' }).click();
    await page.getByText('R$ 3.500,00').first().waitFor();
    await page.getByText('Meta atingida').waitFor();
    await noOverflow(page, 'iphone goals');
    await shot(page, 'iphone-goals');

    // Settings via avatar; enable PIN; lock; wrong PIN; unlock.
    await page.getByRole('navigation').getByRole('link', { name: 'Início' }).first().click();
    await page.getByRole('button', { name: 'Ajustes' }).click();
    await noOverflow(page, 'iphone settings');
    await shot(page, 'iphone-settings');
    await page.getByRole('button', { name: /Bloqueio com PIN/ }).click();
    for (const d of '2580') await page.getByRole('button', { name: d, exact: true }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
    for (const d of '2580') await page.getByRole('button', { name: d, exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await page.getByText('PIN ativado. Dados criptografados.').waitFor({ timeout: 15000 });

    // At rest: nothing readable in IndexedDB.
    const stored = await page.evaluate(
      () =>
        new Promise((res) => {
          const r = indexedDB.open('VeloraFinance');
          r.onsuccess = () => {
            const tx = r.result.transaction('finance_data', 'readonly');
            const q = tx.objectStore('finance_data').get('velora_finance_data');
            q.onsuccess = () => res(JSON.stringify(q.result));
          };
        }),
    );
    assert.ok(stored.includes('"vault":1'), 'stored as vault');
    assert.ok(!/Souza|Aluguel|2830|Reserva de/.test(stored), 'no plaintext at rest');

    await page.getByRole('button', { name: 'Bloquear agora' }).click();
    await page.getByRole('heading', { name: 'Digite seu PIN' }).waitFor();
    assert.equal(await page.getByText('Ana').count(), 0, 'no data visible when locked');
    for (const d of '1111') await page.getByRole('button', { name: d, exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await page.getByText('PIN incorreto').waitFor({ timeout: 15000 });
    await shot(page, 'iphone-lock', false);
    for (const d of '2580') await page.getByRole('button', { name: d, exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await page.getByRole('heading', { name: 'Ajustes' }).waitFor({ timeout: 15000 });

    // Survives a reload: locked again, unlock, data intact.
    await page.reload();
    await page.getByRole('heading', { name: 'Digite seu PIN' }).waitFor();
    await page.keyboard.type('2580');
    await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: 'Ajustes' }).waitFor({ timeout: 15000 });
    await page.getByRole('navigation').getByRole('link', { name: 'Início' }).first().click();
    await page.getByText('R$ 3.099,23').first().waitFor(); // Padaria 38,90 → 40,00

    // Dark mode.
    await page.getByRole('button', { name: 'Ajustes' }).click();
    await page.getByRole('button', { name: 'Escuro' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Início' }).first().click();
    await shot(page, 'iphone-home-dark');
    await page.getByRole('navigation').getByRole('link', { name: 'Gastos' }).first().click();
    await shot(page, 'iphone-spending-dark');

    // Export a backup for the import test below.
    await page.getByRole('navigation').getByRole('link', { name: 'Início' }).first().click();
    await page.getByRole('button', { name: 'Ajustes' }).click();
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Exportar backup/ }).click()]);
    const backupPath = path.join(OUT, '..', '..', 'node_modules', '.tmp-velora-backup.json');
    await download.saveAs(backupPath);
    await ctx.close();

    // ── Desktop: restore that backup through onboarding, then screenshots ─
    const d = await newPage(browser, 'desktop');
    await d.page.goto(BASE);
    await d.page.locator('input[type=file]').setInputFiles(backupPath);
    await d.page.getByRole('heading', { name: 'Olá, Ana' }).waitFor();
    await d.page.getByRole('button', { name: 'Ajustes' }).count(); // desktop uses sidebar link
    await d.page.getByRole('navigation').getByRole('link', { name: 'Ajustes' }).first().click();
    await d.page.getByRole('button', { name: 'Claro' }).click();
    await d.page.getByRole('navigation').getByRole('link', { name: 'Início' }).first().click();
    await d.page.getByText('R$ 3.099,23').first().waitFor();
    await noOverflow(d.page, 'desktop home');
    await shot(d.page, 'desktop-home', false);
    for (const [link, name] of [['Extrato', 'desktop-activity'], ['Gastos', 'desktop-spending'], ['Contas', 'desktop-accounts'], ['Metas', 'desktop-goals'], ['Ajustes', 'desktop-settings']]) {
      await d.page.getByRole('navigation').getByRole('link', { name: link }).first().click();
      await noOverflow(d.page, name);
      await shot(d.page, name, false);
    }
    // Keyboard: N opens the entry sheet.
    await d.page.getByRole('navigation').getByRole('link', { name: 'Início' }).first().click();
    await d.page.keyboard.press('n');
    await d.page.locator('dialog[open]').getByLabel('Valor').waitFor();
    await shot(d.page, 'desktop-new-entry', false);
    await d.page.keyboard.press('Escape');
    await d.page.getByRole('navigation').getByRole('link', { name: 'Ajustes' }).first().click();
    await d.page.getByRole('button', { name: 'Escuro' }).click();
    await d.page.getByRole('navigation').getByRole('link', { name: 'Início' }).first().click();
    await shot(d.page, 'desktop-home-dark', false);
    await d.ctx.close();
    fs.rmSync(backupPath, { force: true });
  }

  // ── Chrome on iPhone: install instructions point at the top-right Share ─
  {
    const { ctx, page } = await newPage(browser, 'iphoneChrome');
    await page.goto(BASE);
    for (const cur of ['US$ USD', '€ EUR', 'R$ BRL']) {
      await page.getByRole('button', { name: cur }).click();
      await page.getByLabel(/Orçamento mensal/).fill('12.345,67');
      await moneyFieldsClear(page, `onboarding ${cur}`);
    }
    await shot(page, 'iphone-onboarding-filled', false);
    await onboard(page, { budget: '', bank: null });
    await page.getByRole('button', { name: 'Como instalar' }).click();
    await page.getByText('Toque em Compartilhar no canto superior direito, ao lado do endereço').waitFor();
    await shot(page, 'iphone-chrome-install', false);
    await ctx.close();
  }

  // ── Spanish + desktop onboarding ───────────────────────────────────────
  {
    const { ctx, page } = await newPage(browser, 'desktop');
    await page.goto(BASE);
    await shot(page, 'desktop-onboarding', false);
    await page.getByRole('button', { name: 'Español' }).click();
    await page.getByRole('heading', { name: /Vamos a ordenar/ }).first().waitFor();
    await ctx.close();
  }

  await browser.close();

  if (problems.length) {
    console.error('\nE2E problems:\n' + problems.map((p) => ' - ' + p).join('\n'));
    process.exit(1);
  }
  console.log('E2E OK — screenshots in docs/screenshots/');
})().catch((e) => {
  console.error(e);
  if (problems.length) console.error(problems.join('\n'));
  process.exit(1);
});
