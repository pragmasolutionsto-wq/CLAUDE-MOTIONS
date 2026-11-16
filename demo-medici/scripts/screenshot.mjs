// Uso: npm run shot -- <slug>
// Serve dist/ in locale, apre home e articolo su desktop e mobile, salva screenshot in shots/<slug>/
// e segnala: errori console, richieste fallite, scroll orizzontale, noindex mancante, banner mancante.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(require.resolve('playwright', { paths: ['/usr/local/lib/node_modules', '/usr/lib/node_modules'] })); }
const { chromium, devices } = pw;

const slug = process.argv[2];
if (!slug) { console.error('Uso: npm run shot -- <slug>'); process.exit(1); }
const PORT = 4329;
const out = new URL(`../shots/${slug}/`, import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const astroBin = new URL('../node_modules/.bin/astro', import.meta.url).pathname;
const server = spawn(astroBin, ['preview', '--port', String(PORT), '--host', '127.0.0.1'], { stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid); } catch {} };
const base = `http://127.0.0.1:${PORT}`;
for (let i = 0; i < 60; i++) {
  try { await fetch(base); break; } catch { await new Promise((r) => setTimeout(r, 500)); }
}

const browser = await chromium.launch();
const problemi = [];
const pagine = [['home', `/${slug}`], ['articolo', `/${slug}/articolo`]];
const viste = [
  ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
  ['mobile', { ...devices['iPhone 13'] }],
];

for (const [vNome, ctxOpt] of viste) {
  const ctx = await browser.newContext(ctxOpt);
  for (const [pNome, path] of pagine) {
    const page = await ctx.newPage();
    const tag = `${pNome}/${vNome}`;
    page.on('console', (m) => { if (m.type() === 'error') problemi.push(`[${tag}] console: ${m.text()}`); });
    page.on('pageerror', (e) => problemi.push(`[${tag}] pageerror: ${e.message}`));
    page.on('requestfailed', (r) => problemi.push(`[${tag}] request failed: ${r.url()} ${r.failure()?.errorText}`));
    const res = await page.goto(base + path, { waitUntil: 'networkidle' });
    if (!res || res.status() !== 200) problemi.push(`[${tag}] status ${res?.status()}`);

    // Scorre tutta la pagina per far partire i reveal
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 400) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 70)); }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(1300);

    const check = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
      banner: document.body.innerText.includes('Anteprima non ufficiale realizzata da Pragma Solutions'),
      nascosti: [...document.querySelectorAll('[data-reveal], [data-stagger] > *')].filter((e) => getComputedStyle(e).opacity < 0.5).length,
      font: document.fonts.check(`600 16px "${getComputedStyle(document.documentElement).getPropertyValue('--f-head').split(',')[0].replace(/'/g, '').trim()}"`),
    }));
    if (check.overflow > 1) problemi.push(`[${tag}] scroll orizzontale di ${check.overflow}px`);
    if (check.robots !== 'noindex, nofollow') problemi.push(`[${tag}] meta robots: ${check.robots}`);
    if (!check.banner) problemi.push(`[${tag}] fascia "Anteprima" mancante`);
    if (check.nascosti) problemi.push(`[${tag}] ${check.nascosti} elementi ancora invisibili dopo lo scroll`);
    if (!check.font) problemi.push(`[${tag}] font titoli non caricato`);

    await page.screenshot({ path: `${out}${pNome}-${vNome}-top.png` });
    await page.addStyleTag({ content: '[data-mobile-cta]{display:none!important}' }); // fixed: falserebbe il full-page
    await page.screenshot({ path: `${out}${pNome}-${vNome}-full.png`, fullPage: true });
    await page.close();
  }
  await ctx.close();
}

// La root non deve elencare demo
const ctx = await browser.newContext();
const root = await ctx.newPage();
await root.goto(base + '/');
const links = await root.$$eval('a', (a) => a.length);
if (links) problemi.push(`[root] la root contiene ${links} link: non deve elencare le demo`);
await root.screenshot({ path: `${out}root.png` });

await browser.close();
stop();
console.log(`Screenshot in ${out}`);
if (problemi.length) { console.log('PROBLEMI:\n' + problemi.join('\n')); process.exit(2); }
console.log('OK: nessun problema rilevato.');
process.exit(0);
