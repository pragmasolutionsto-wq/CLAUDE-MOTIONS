// Tutto ciò che si cambia senza toccare le scene: colori, font, testi, contatti.
export const COL = {
  petrol: '#0E5C63',
  petrolDark: '#0A474D',
  magenta: '#EC0777',
  turq: '#1EA7B2',
  cream: '#F5F7EF',
  ink: '#3C5C5C',
  white: '#FFFFFF',
  wood: '#E6D3AF',
  kraft: '#D9BF92',
  skin: '#F1E2CC',
  green: '#2F9B7E',
};

export const FONT = {title: "'Bebas Neue'", body: "'Montserrat'"};

export const INFO = {
  name: 'Farmacia Africa Orientale',
  address: 'Corso Garibaldi 49 · Brindisi',
  phone: '+39 328 837 3357',
  // DA VERIFICARE col cliente: il sito mostra ancora l'orario estivo 08:30–13:00 · 17:00–20:30
  hours: 'Orario invernale 08:30–13:00 · 16:30–20:00',
  cta: 'Scrivici su WhatsApp',
};

export type Cap = {a: number; b: number; k?: string; t: string; s?: string};
// a/b in secondi. t = titolo (Bebas), s = sottotitolo (Montserrat), k = etichetta piccola
export const CAPS: Cap[] = [
  {a: 1.2, b: 5.6, k: 'Brindisi · Corso Garibaldi', t: 'Dal 1909'},
  {a: 7.0, b: 12.2, t: 'Una farmacia di famiglia', s: 'Costruita pezzo dopo pezzo'},
  {a: 12.8, b: 15.9, t: 'Ti ascoltiamo al banco', s: 'Consigli spiegati con parole semplici'},
  {a: 17.2, b: 20.8, k: 'Senza prenotazione', t: 'Pressione arteriosa', s: 'Pochi minuti, strumenti validati'},
  {a: 21.6, b: 25.2, k: 'Su prenotazione', t: 'Elettrocardiogramma', s: 'Rapido e indolore'},
  {a: 26.0, b: 29.6, k: 'Analisi rapide', t: 'Glicemia e peso', s: 'Controlli veloci, subito'},
  {a: 30.4, b: 33.8, k: 'Farmacisti preparatori', t: 'Preparazioni galeniche', s: 'Fatte su misura, in laboratorio'},
  {a: 34.7, b: 37.3, t: 'Tre stanze', s: 'Un solo modo di prendersi cura'},
  {a: 37.6, b: 40.6, k: 'Health Room', t: 'Salute e prevenzione', s: 'Rischi sotto controllo, terapie serene'},
  {a: 40.8, b: 43.6, k: 'Wellness Room', t: 'Equilibrio e benessere', s: 'Sonno, digestione, stress'},
  {a: 43.8, b: 46.2, k: 'Beauty Room', t: 'Viso, corpo e capelli'},
  {a: 49.0, b: 53.8, k: 'Lorenzo · Paolo · Olga e Francesca', t: 'Tre generazioni', s: 'Un solo indirizzo'},
];
