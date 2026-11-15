import type esempio from '../data/medici/motta-m2zh.json';

// Lo schema di riferimento è il JSON di Motta: ogni nuovo medico deve avere gli stessi campi.
export type Medico = typeof esempio;

const files = import.meta.glob<{ default: Medico }>('../data/medici/*.json', { eager: true });

export const medici: Medico[] = Object.entries(files).map(([path, mod]) => {
  const m = mod.default;
  const atteso = path.split('/').pop()!.replace('.json', '');
  if (m.slug !== atteso) throw new Error(`Slug "${m.slug}" diverso dal nome file "${atteso}.json"`);
  return m;
});

export const nomeCompleto = (m: Medico) => `${m.titolo} ${m.nome}`;
export const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`;
export const mapsHref = (indirizzo: string, citta: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${indirizzo}, ${citta}`)}`;
