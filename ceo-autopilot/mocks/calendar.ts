import type { CalendarEvent, EventCategory, Severity } from '@/types/domain';
import { CUSTOMERS } from './company';
import { weekAt } from './time';

// Tre settimane di calendario: precedente, corrente (pesante: oltre 28 ore di riunioni), prossima.

type Row = [
  day: number,
  start: string,
  end: string,
  title: string,
  category: EventCategory,
  opts?: Partial<
    Pick<
      CalendarEvent,
      | 'external'
      | 'counterparty'
      | 'recurring'
      | 'ownerIsDecider'
      | 'importance'
      | 'irreversibleDecision'
      | 'participants'
      | 'kind'
      | 'location'
    >
  >,
];

const G = 'Giorgio Rosso';
const L = 'Laura Bianchi';
const E = 'Elena Conti';

const lunch = (d: number): Row => [d, '13:00', '14:00', 'Pranzo', 'personale', { kind: 'personal' }];
const lowInternal = (participants: string[]) => ({
  recurring: true,
  ownerIsDecider: false,
  importance: 'low' as Severity,
  participants,
});

// Settimana corrente. Oggi è martedì (indice 1).
const current: Row[] = [
  // Lunedì: 6 h 30
  [0, '09:00', '10:00', 'Riunione di produzione settimanale', 'interno', lowInternal([G])],
  [0, '10:00', '11:30', 'Audit cliente: Idraulica Nord', 'clienti', { external: true, counterparty: CUSTOMERS.idraulica, importance: 'high', participants: ['Resp. qualità Idraulica Nord', G] }],
  [0, '11:45', '12:45', 'Budget 2027: prima lettura', 'strategico', { importance: 'high', participants: [L] }],
  lunch(0),
  [0, '14:00', '15:00', 'Fornitore acciai: prezzi primo trimestre', 'operativo', { external: true, counterparty: 'Acciai del Piemonte', importance: 'medium', participants: ['Agente Acciai del Piemonte'] }],
  [0, '15:15', '16:15', 'Avanzamento commesse', 'interno', lowInternal([G, E])],
  [0, '16:30', '17:30', 'Sicurezza: riunione periodica', 'operativo', { importance: 'medium', participants: ['RSPP', G] }],

  // Martedì (oggi): 6 h, un solo spazio libero alle 15:00
  [1, '09:00', '10:00', 'Riunione di produzione settimanale', 'interno', lowInternal([G])],
  [1, '10:00', '11:00', 'Tecnoauto Group: revisione forniture', 'clienti', { external: true, counterparty: CUSTOMERS.tecnoauto, importance: 'high', participants: ['Resp. acquisti Tecnoauto', E] }],
  [1, '11:15', '12:15', 'BPER: rinnovo fido', 'strategico', { external: true, counterparty: 'BPER', importance: 'high', participants: ['Silvia Arduino', L] }],
  lunch(1),
  [1, '14:00', '15:00', 'Comitato qualità', 'interno', lowInternal([G, 'Resp. qualità'])],
  [1, '16:00', '17:00', 'Colloquio: responsabile qualità', 'operativo', { importance: 'medium', participants: ['Candidato', L] }],
  [1, '17:00', '18:00', 'Alpi Robotics: offerta 2027', 'clienti', { external: true, counterparty: CUSTOMERS.alpi, importance: 'high', participants: ['Paolo Ricci', E], location: 'Video' }],

  // Mercoledì: 6 h 30, con la firma del nuovo macchinario
  [2, '09:30', '10:30', 'Allineamento commerciale', 'interno', lowInternal([E])],
  [2, '10:30', '11:30', 'Firma ordine centro di lavoro 5 assi', 'strategico', { external: true, counterparty: 'Macchine Utensili Lombarde', importance: 'high', irreversibleDecision: true, participants: ['Ing. Carla Fontana', L] }],
  [2, '11:45', '12:45', 'Piano ferie e turni di dicembre', 'interno', lowInternal([G, L])],
  lunch(2),
  [2, '14:00', '15:30', 'Freni Padani: piano consegne', 'clienti', { external: true, counterparty: CUSTOMERS.freni, importance: 'high', participants: ['Davide Marchi', G] }],
  [2, '15:45', '16:45', 'Commercialista: chiusura anno', 'strategico', { external: true, counterparty: 'Studio Gallo Commercialisti', importance: 'medium', participants: ['Dott. Stefano Gallo', L] }],
  [2, '17:00', '18:00', 'Avanzamento commesse', 'interno', lowInternal([G, E])],

  // Giovedì: 6 h, giornata spezzettata
  [3, '09:00', '10:00', 'Riunione reparto tornitura', 'interno', lowInternal([G])],
  [3, '10:15', '11:15', 'Consulente bandi: investimenti 4.0', 'strategico', { external: true, counterparty: 'Consulente bandi', importance: 'medium', participants: ['Consulente bandi', L] }],
  [3, '11:30', '12:30', 'Offerta Alpi Robotics: revisione prezzi', 'clienti', { importance: 'high', participants: [E] }],
  lunch(3),
  [3, '14:00', '15:00', 'Motori Monviso: nuova commessa', 'clienti', { external: true, counterparty: CUSTOMERS.motori, importance: 'medium', participants: ['Resp. tecnico Motori Monviso', E] }],
  [3, '15:15', '16:15', 'Manutenzione: piano gennaio', 'operativo', lowInternal([G])],
  [3, '16:30', '17:30', 'Colloquio: operatore CNC', 'operativo', { importance: 'medium', participants: ['Candidato', G] }],
  [3, '19:30', '21:30', 'Cena associazione industriali', 'personale', { kind: 'personal' }],

  // Venerdì: 3 h 30, la giornata più leggera
  [4, '09:00', '10:00', 'Riunione di produzione: chiusura settimana', 'interno', lowInternal([G])],
  [4, '11:00', '12:30', 'Stampi Canavese: visita in azienda', 'clienti', { external: true, counterparty: CUSTOMERS.stampi, importance: 'medium', participants: ['Titolare Stampi Canavese', E] }],
  lunch(4),
  [4, '16:00', '17:00', 'Amministrazione: scadenze di dicembre', 'interno', { importance: 'medium', participants: [L] }],
];

// Settimana precedente (circa 30 ore) e prossima (più leggera): generate dallo stesso schema.
const template = (heavy: boolean): Row[] => {
  const rows: Row[] = [];
  for (let d = 0; d < 5; d++) {
    rows.push([d, '09:00', '10:00', 'Riunione di produzione', 'interno', lowInternal([G])]);
    rows.push([d, '10:30', '12:00', ['Cliente: avanzamento ordini', 'Fornitori: riallineamento prezzi', 'Budget 2027', 'Visita cliente', 'Revisione offerte'][d], d % 2 ? 'strategico' : 'clienti', { importance: 'medium', external: d % 2 === 0, participants: [E] }]);
    rows.push(lunch(d));
    rows.push([d, '14:00', '15:30', ['Avanzamento commesse', 'Qualità: non conformità', 'Banca: aggiornamento', 'Commerciale: pipeline', 'Amministrazione'][d], d === 2 ? 'strategico' : 'interno', { importance: 'medium', participants: [L] }]);
    if (heavy && d === 0) {
      // Lunedì da 9 ore: è il giorno peggiore del mese nel grafico carico/recupero.
      rows.push([d, '08:00', '09:00', 'Colazione di lavoro con cliente', 'clienti', { external: true, importance: 'medium', participants: [E] }]);
      rows.push([d, '18:00', '20:00', 'Assemblea associazione di categoria', 'strategico', { external: true, importance: 'low', participants: [] }]);
    }
    if (heavy) {
      rows.push([d, '15:45', '16:45', 'Allineamento reparti', 'interno', lowInternal([G, E])]);
      rows.push([d, '17:00', '18:00', ['Colloquio', 'Fornitore', 'Sicurezza', 'Cliente in video', 'Chiusura settimana'][d], 'operativo', { importance: 'medium', participants: [G] }]);
    }
  }
  return rows;
};

function build(rows: Row[], weekOffset: number, prefix: string): CalendarEvent[] {
  return rows.map(([d, start, end, title, category, opts], i) => ({
    id: `${prefix}-${i + 1}`,
    title,
    start: weekAt(weekOffset, d, start),
    end: weekAt(weekOffset, d, end),
    category,
    kind: opts?.kind ?? 'meeting',
    participants: opts?.participants ?? [],
    external: opts?.external ?? false,
    counterparty: opts?.counterparty,
    recurring: opts?.recurring,
    ownerIsDecider: opts?.ownerIsDecider ?? true,
    importance: opts?.importance ?? 'medium',
    irreversibleDecision: opts?.irreversibleDecision,
    location: opts?.location,
  }));
}

export const calendarHeavy: CalendarEvent[] = [
  ...build(template(true), -1, 'ev-p'),
  ...build(current, 0, 'ev-c'),
  ...build(template(false), 1, 'ev-n'),
];

// Giornata "normale" del pannello demo: stessa settimana senza le riunioni interne ricorrenti.
export const calendarNormal: CalendarEvent[] = [
  ...build(template(false), -1, 'ev-p'),
  ...build(
    current.filter(([, , , , , o]) => !(o?.recurring && o.importance === 'low')),
    0,
    'ev-c',
  ),
  ...build(template(false), 1, 'ev-n'),
];
