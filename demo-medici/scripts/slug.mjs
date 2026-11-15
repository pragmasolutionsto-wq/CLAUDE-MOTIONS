// Uso: npm run slug -- <cognome>   →   motta-k7x2
// Suffisso casuale di 4 caratteri, senza caratteri ambigui (0/o, 1/l/i).
import { readdirSync } from 'node:fs';
const base = (process.argv[2] || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
if (!base) { console.error('Uso: npm run slug -- <cognome>'); process.exit(1); }
const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
const esistenti = new Set(readdirSync(new URL('../src/data/medici/', import.meta.url)).map((f) => f.replace('.json', '')));
let slug;
do {
  const rnd = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => chars[b % chars.length]).join('');
  slug = `${base}-${rnd}`;
} while (esistenti.has(slug));
console.log(slug);
