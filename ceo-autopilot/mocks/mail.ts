import type { MailThread } from '@/types/domain';
import { seeded } from '@/lib/utils';
import { CUSTOMERS, SUPPLIERS } from './company';
import { at } from './time';

// 40 thread degli ultimi 7 giorni: 5 urgenti veri, 8 in attesa di altri, 27 di rumore.

const todo: MailThread[] = [
  {
    id: 'mail-1',
    channel: 'mail',
    from: 'Davide Marchi',
    org: CUSTOMERS.freni,
    subject: 'Conferma consegna lotto dischi 4471',
    snippet:
      'Buongiorno Marco, ci serve conferma della consegna entro il 9 dicembre per pianificare la linea. Riesci a darmi una data certa?',
    receivedAt: at(-2, '16:42'),
    bucket: 'todo',
    urgencyReason: 'Cliente top 4 · chiede conferma consegna · 2 giorni fa',
    draftReply:
      'Buongiorno Davide,\n\nconfermo la consegna del lotto 4471 entro mercoledì 9 dicembre. Giorgio Rosso ti manda domani il piano di spedizione con i colli.\n\nA presto,\nMarco Ferraris',
    messages: 3,
  },
  {
    id: 'mail-2',
    channel: 'mail',
    from: 'Silvia Arduino',
    org: 'BPER · Gestore imprese',
    subject: 'Rinnovo fido: documenti mancanti',
    snippet:
      'Per l’istruttoria del rinnovo mi mancano il bilancio provvisorio al 30/09 e il prospetto ordini. Mi servono entro venerdì.',
    receivedAt: at(-1, '11:05'),
    bucket: 'todo',
    urgencyReason: 'Fido da € 250.000 in rinnovo · scadenza venerdì',
    draftReply:
      'Buongiorno Silvia,\n\nle faccio avere entro giovedì il bilancio provvisorio al 30/09 e il prospetto ordini aggiornato. Li prepara Laura Bianchi, in copia.\n\nCordiali saluti,\nMarco Ferraris',
    messages: 2,
  },
  {
    id: 'mail-3',
    channel: 'mail',
    from: 'Paolo Ricci',
    org: CUSTOMERS.alpi,
    subject: 'Offerta 2027: ci serve entro giovedì',
    snippet:
      'Marco, il nostro comitato acquisti si riunisce venerdì. Senza la vostra offerta aggiornata sui volumi 2027 non riesco a portarvi in discussione.',
    receivedAt: at(-1, '18:20'),
    bucket: 'todo',
    urgencyReason: 'Cliente top 2 · offerta annuale · scadenza giovedì',
    draftReply:
      'Ciao Paolo,\n\nl’offerta 2027 ti arriva entro giovedì mattina. Elena Conti sta chiudendo i prezzi sui tre scaglioni di volume: se preferisci la vediamo insieme in video prima dell’invio.\n\nMarco',
    messages: 4,
  },
  {
    id: 'mail-4',
    channel: 'mail',
    from: 'Laura Bianchi',
    org: 'Amministrazione',
    subject: 'Tredicesime: serve il tuo ok sul giroconto',
    snippet:
      'Per pagare stipendi e tredicesime il 22 conviene spostare € 60.000 da BPER a Intesa. Mi dai l’ok entro giovedì?',
    receivedAt: at(0, '06:48'),
    bucket: 'todo',
    urgencyReason: 'Interno · decisione tua · legata alla liquidità di dicembre',
    draftReply:
      'Ciao Laura,\n\nok al giroconto di € 60.000 da BPER a Intesa. Preparalo tu, lo autorizzo io dall’home banking.\n\nMarco',
    messages: 1,
  },
  {
    id: 'mail-5',
    channel: 'mail',
    from: 'Ing. Carla Fontana',
    org: 'Macchine Utensili Lombarde',
    subject: 'Centro di lavoro 5 assi: l’offerta scade il 4 dicembre',
    snippet:
      'Le confermo che le condizioni riservate (sconto 6% e consegna a marzo) restano valide fino a venerdì 4 dicembre.',
    receivedAt: at(-3, '09:30'),
    bucket: 'todo',
    urgencyReason: 'Investimento da € 420.000 · offerta in scadenza venerdì',
    draftReply:
      'Gentile Ing. Fontana,\n\ngrazie della conferma. Le do una risposta definitiva entro venerdì mattina.\n\nCordiali saluti,\nMarco Ferraris',
    messages: 5,
  },
];

const waiting: MailThread[] = [
  ['Ufficio acquisti', CUSTOMERS.tecnoauto, 'Estratto conto e fatture scadute', 'Abbiamo girato la richiesta alla contabilità fornitori, vi aggiorniamo.', -9],
  ['Giorgio Rosso', 'Produzione', 'Preventivo manutenzione tornio 3', 'Aspetto il preventivo dal manutentore, dovrebbe arrivare in settimana.', -4],
  ['Elena Conti', 'Commerciale', 'Listino 2027 bozza', 'Ti mando la bozza completa appena ho i costi dell’acciaio aggiornati.', -3],
  ['Studio Gallo', SUPPLIERS.studio, 'Simulazione acconto IVA', 'In lavorazione, ve la inviamo entro il 10.', -5],
  ['Servizio clienti', SUPPLIERS.energia, 'Richiesta rateizzazione conguaglio', 'La pratica è stata presa in carico. Tempo di risposta: 5 giorni lavorativi.', -6],
  ['Amministrazione', CUSTOMERS.idraulica, 'Fattura 401/2026', 'In pagamento con la prossima distinta.', -2],
  ['Risorse umane', 'Agenzia Lavoro Torino', 'Profili operatore CNC', 'Vi inviamo tre candidature entro venerdì.', -4],
  ['Assistenza', 'Gestionale Officina', 'Ticket 88231: export distinte', 'Il ticket è stato assegnato a un tecnico.', -7],
].map(([from, org, subject, snippet, off], i) => ({
  id: `mail-w${i + 1}`,
  channel: 'mail' as const,
  from: from as string,
  org: org as string,
  subject: subject as string,
  snippet: snippet as string,
  receivedAt: at(off as number, `${10 + (i % 7)}:${String((i * 13) % 60).padStart(2, '0')}`),
  bucket: 'waiting' as const,
  urgencyReason: `In attesa di risposta da ${-(off as number)} giorni`,
  messages: 2 + (i % 3),
}));

const noiseTemplates: [string, string, string][] = [
  ['Fiera Meccanica Italia', 'Iscrizioni aperte all’edizione 2027', 'Prenota il tuo stand con tariffa anticipata.'],
  ['Notifiche Gestionale', 'Riepilogo giornaliero ordini', '12 ordini aggiornati, 3 nuovi DDT.'],
  ['Newsletter Subfornitura', 'Le novità della settimana', 'Acciai speciali, prezzi e tendenze del mercato.'],
  ['Corriere Espresso Nord', 'Spedizione in consegna', 'La spedizione 77120 è in consegna oggi.'],
  ['Portale Fornitori', 'Nuovo documento disponibile', 'È disponibile un nuovo documento nella tua area riservata.'],
  ['Webinar Industria', 'Invito: manutenzione predittiva', 'Giovedì alle 17:00, partecipazione gratuita.'],
  ['Assicurazioni Sabaude', 'Promemoria rinnovo polizza', 'La polizza si rinnova automaticamente il 31 gennaio.'],
  ['Calendario', 'Invito aggiornato: Comitato qualità', 'L’evento è stato aggiornato dall’organizzatore.'],
  ['Telefonia Aziende', 'La tua fattura è disponibile', 'Importo € 312,40, addebito il 15 dicembre.'],
];

const rnd = seeded(404);
const noise: MailThread[] = Array.from({ length: 27 }, (_, i) => {
  const [from, subject, snippet] = noiseTemplates[i % noiseTemplates.length];
  return {
    id: `mail-n${i + 1}`,
    channel: 'mail' as const,
    from,
    subject,
    snippet,
    receivedAt: at(-Math.floor(i / 4), `${7 + Math.floor(rnd() * 11)}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`),
    bucket: 'noise' as const,
    messages: 1,
  };
});

export const threads: MailThread[] = [...todo, ...waiting, ...noise];

// WhatsApp Business: di default non è collegato. Questi messaggi compaiono solo se lo colleghi dalla demo.
export const whatsappThreads: MailThread[] = [
  {
    id: 'wa-1',
    channel: 'whatsapp',
    from: 'Luca · Officine Valsusa',
    subject: 'Ritiro materiale',
    snippet: 'Buongiorno, possiamo ritirare i particolari giovedì mattina?',
    receivedAt: at(-1, '17:12'),
    bucket: 'todo',
    urgencyReason: 'Cliente · chiede una conferma · ieri',
    draftReply: 'Buongiorno Luca, giovedì mattina va bene. Il materiale è pronto dalle 8:30 in magazzino.',
    messages: 2,
  },
  {
    id: 'wa-2',
    channel: 'whatsapp',
    from: 'Trasporti Alpini · Dispatch',
    subject: 'Finestra di carico',
    snippet: 'Confermata la finestra di carico di domani 14:00–15:00.',
    receivedAt: at(-1, '12:40'),
    bucket: 'noise',
    messages: 1,
  },
];
