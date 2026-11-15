// Uso: npm run deploy   (fa build + pubblica su Cloudflare Pages)
// Il sito statico in dist/ viene impacchettato dentro un _worker.js (Pages advanced mode)
// e caricato con UNA sola richiesta autenticata dal token API. Niente wrangler: il suo upload
// a due passaggi (JWT) non passa dal proxy dei container cloud.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || '0d93afbbfd4d255b5c3091bd86afe3ae';
const PROJECT = process.env.CF_PAGES_PROJECT || 'pragma-anteprime';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN || 'proxy-injected'; // nel cloud lo inietta il proxy
const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/pages/projects`;
const H = { Authorization: `Bearer ${TOKEN}` };
const dist = new URL('../dist/', import.meta.url).pathname;

const TIPI = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const TESTO = new Set(['.html', '.js', '.css', '.json', '.txt', '.svg']);

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = {};
for (const f of walk(dist)) {
  const rel = '/' + relative(dist, f);
  if (rel === '/_headers') continue; // gli header li mette il worker
  const ext = extname(f).toLowerCase();
  const buf = readFileSync(f);
  files[rel] = TESTO.has(ext) ? { t: TIPI[ext], s: buf.toString('utf8') } : { t: TIPI[ext] || 'application/octet-stream', b: buf.toString('base64') };
}

const worker = `const F = ${JSON.stringify(files)};
const bin = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
export default {
  async fetch(req) {
    const url = new URL(req.url);
    let p = decodeURIComponent(url.pathname);
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    const f = F[p] || F[p + '/index.html'] || F[p + '.html'] || (p === '/' ? F['/index.html'] : null);
    const h = new Headers({ 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' });
    if (!f) { h.set('Content-Type', 'text/plain; charset=utf-8'); return new Response('Pagina non trovata', { status: 404, headers: h }); }
    h.set('Content-Type', f.t);
    h.set('Cache-Control', p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate');
    if (req.method === 'HEAD') return new Response(null, { headers: h });
    return new Response(f.s !== undefined ? f.s : bin(f.b), { headers: h });
  },
};
`;
console.log(`Worker: ${Object.keys(files).length} file, ${(worker.length / 1024).toFixed(0)} KB`);

// Crea il progetto se non esiste
const ex = await (await fetch(`${API}/${PROJECT}`, { headers: H })).json();
if (!ex.success) {
  const c = await (await fetch(API, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: PROJECT, production_branch: 'main' }) })).json();
  if (!c.success) { console.error('Creazione progetto fallita:', JSON.stringify(c.errors)); process.exit(1); }
  console.log(`Progetto creato: ${c.result.subdomain}`);
}

const form = new FormData();
form.append('manifest', '{}');
form.append('branch', 'main');
form.append('_worker.js', new Blob([worker], { type: 'application/javascript' }), '_worker.js');
const j = await (await fetch(`${API}/${PROJECT}/deployments`, { method: 'POST', headers: H, body: form })).json();
if (!j.success) { console.error('Deploy fallito:', JSON.stringify(j.errors)); process.exit(1); }
console.log(`Deploy OK\n  ${j.result.url}\n  https://${PROJECT}.pages.dev`);
