import { addDays } from 'date-fns';
import { at, day } from './time';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  initials: string;
}

export interface ClinicReport {
  id: string;
  title: string;
  date: string;
  commentedBy: string;
}

export interface DoctorProposal {
  id: string;
  doctorId: string;
  title: string;
  description: string;
  duration: string;
  price: number;
}

export interface BloodCenter {
  city: string;
  name: string;
  address: string;
}

export const doctors: Doctor[] = [
  { id: 'doc-1', name: 'Dott.ssa Giulia Marchetti', specialty: 'Medicina interna', initials: 'GM' },
  { id: 'doc-2', name: 'Dott. Paolo Venturi', specialty: 'Medicina dello sport', initials: 'PV' },
];

export const checkup = {
  lastDate: at(-162, '09:00'), // 22 giugno
  nextDueDate: at(21, '09:00'), // 22 dicembre: tra 3 settimane
  includes: [
    'Visita con il medico Longevitas',
    'Prelievo con pannello esteso',
    'Elettrocardiogramma a riposo',
    'Composizione corporea',
    'Colloquio di restituzione con il tuo medico',
  ],
};

export const reports: ClinicReport[] = [
  { id: 'rep-1', title: 'Referto check-up di giugno 2026', date: at(-155, '12:00'), commentedBy: 'Dott.ssa Giulia Marchetti' },
  { id: 'rep-2', title: 'Esami del sangue di giugno 2026', date: at(-158, '12:00'), commentedBy: 'Dott.ssa Giulia Marchetti' },
];

// Le proposte arrivano dal medico dopo un check-up, mai dal software.
export const proposals: DoctorProposal[] = [
  {
    id: 'prop-1',
    doctorId: 'doc-1',
    title: 'Percorso sonno e recupero',
    description: 'Tre mesi con quattro incontri in video e un piano costruito sulle tue abitudini di lavoro.',
    duration: '3 mesi',
    price: 480,
  },
];

export const bloodCenters: BloodCenter[] = [
  { city: 'Torino', name: 'Centro Analisi San Carlo', address: 'Corso Vittorio 118' },
  { city: 'Torino', name: 'Laboratorio Crocetta', address: 'Via Sacchi 42' },
  { city: 'Milano', name: 'Poliambulatorio Navigli', address: 'Via Vigevano 15' },
  { city: 'Genova', name: 'Centro Prelievi Foce', address: 'Via Casaregis 30' },
  { city: 'Bologna', name: 'Laboratorio Due Torri', address: 'Via Irnerio 12' },
  { city: 'Verona', name: 'Analisi Adige', address: 'Corso Porta Nuova 60' },
  { city: 'Roma', name: 'Centro Diagnostico Prati', address: 'Via Cola di Rienzo 190' },
];

export const clinicAddress = 'Clinica Longevitas, Rivoli (TO)';

/** Slot disponibili simulati: giorni feriali delle prossime 4 settimane. */
export function slots(startOffset = 7, days = 21): { date: string; times: string[] }[] {
  const out: { date: string; times: string[] }[] = [];
  for (let i = startOffset; i < startOffset + days; i++) {
    const d = day(i);
    if ([0, 6].includes(d.getDay())) continue;
    const times = i % 3 === 0 ? ['08:00', '08:30', '11:00'] : i % 3 === 1 ? ['07:30', '09:00'] : ['08:30', '12:00', '17:30'];
    out.push({ date: addDays(d, 0).toISOString(), times });
  }
  return out;
}
