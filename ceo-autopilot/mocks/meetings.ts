import type { MeetingSummary, SourceRef } from '@/types/domain';
import { CUSTOMERS } from './company';
import { at } from './time';

const src = (id: string, when: string): SourceRef => ({
  connector: 'meetings',
  label: 'Trascrizione Meet',
  updatedAt: when,
  recordId: `mtg:${id}`,
});

export const meetings: MeetingSummary[] = [
  {
    id: 'mtg-1',
    title: 'Audit cliente: Idraulica Nord',
    date: at(-1, '10:00'),
    participants: ['Marco Ferraris', 'Giorgio Rosso', 'Resp. qualità Idraulica Nord'],
    summary:
      'Audit superato con due osservazioni minori sulla tracciabilità dei lotti. Il cliente conferma i volumi del primo trimestre e chiede un piano di azione scritto entro due settimane.',
    decisions: ['Piano di azione sulla tracciabilità entro il 15 dicembre', 'Volumi primo trimestre confermati'],
    tasks: [
      { owner: 'Giorgio Rosso', text: 'Scrivere il piano di azione sulla tracciabilità', due: at(14), status: 'open' },
      { owner: 'Marco Ferraris', text: 'Inviare al cliente il verbale firmato', due: at(2), status: 'open' },
    ],
    source: src('mtg-1', at(-1, '11:40')),
  },
  {
    id: 'mtg-2',
    title: 'Budget 2027: prima lettura',
    date: at(-1, '11:45'),
    participants: ['Marco Ferraris', 'Laura Bianchi'],
    summary:
      'Prima bozza del budget: ricavi previsti in crescita del 6%, costo dell’energia ancora incerto. Manca la decisione sul nuovo centro di lavoro, che sposta gli ammortamenti.',
    decisions: ['Seconda lettura dopo la decisione sul centro di lavoro'],
    tasks: [
      { owner: 'Laura Bianchi', text: 'Preparare due versioni del budget, con e senza investimento', due: at(6), status: 'open' },
    ],
    source: src('mtg-2', at(-1, '12:50')),
  },
  {
    id: 'mtg-3',
    title: 'Avanzamento commesse',
    date: at(-6, '15:00'),
    participants: ['Marco Ferraris', 'Giorgio Rosso', 'Elena Conti'],
    summary:
      'Tre commesse in ritardo di una settimana per fermo del tornio 3. La commessa Freni Padani è la più critica: serve una data certa da comunicare al cliente.',
    decisions: ['Priorità alla commessa Freni Padani', 'Straordinari sabato 5 dicembre'],
    tasks: [
      { owner: 'Giorgio Rosso', text: 'Comunicare la nuova data di consegna a Freni Padani', due: at(-2), status: 'overdue' },
      { owner: 'Elena Conti', text: 'Avvisare gli altri due clienti del ritardo', due: at(-4), status: 'done' },
    ],
    source: src('mtg-3', at(-6, '16:20')),
  },
  {
    id: 'mtg-4',
    title: `${CUSTOMERS.tecnoauto}: condizioni di pagamento`,
    date: at(-8, '10:30'),
    participants: ['Marco Ferraris', 'Elena Conti', 'Resp. acquisti Tecnoauto'],
    summary:
      'Il cliente riconosce i ritardi nei pagamenti e li attribuisce a un cambio di gestionale. Si impegna a saldare lo scaduto entro fine novembre. Chiede in cambio di mantenere i prezzi 2026 per il primo trimestre.',
    decisions: ['Prezzi 2026 confermati per il primo trimestre, a fronte del saldo dello scaduto'],
    tasks: [
      { owner: 'Elena Conti', text: 'Mandare a Tecnoauto il riepilogo delle fatture scadute', due: at(-6), status: 'done' },
      { owner: 'Laura Bianchi', text: 'Verificare l’incasso dello scaduto Tecnoauto', due: at(-1), status: 'overdue' },
    ],
    source: src('mtg-4', at(-8, '11:45')),
  },
  {
    id: 'mtg-5',
    title: 'Comitato qualità',
    date: at(-7, '14:00'),
    participants: ['Giorgio Rosso', 'Resp. qualità', 'Marco Ferraris'],
    summary:
      'Non conformità in calo: 14 nel mese contro 21 del mese precedente. Resta aperto il tema della taratura degli strumenti del reparto fresatura.',
    decisions: ['Taratura straordinaria degli strumenti del reparto fresatura'],
    tasks: [
      { owner: 'Giorgio Rosso', text: 'Programmare la taratura con il laboratorio esterno', due: at(-3), status: 'overdue' },
    ],
    source: src('mtg-5', at(-7, '15:10')),
  },
  {
    id: 'mtg-6',
    title: 'Fornitore acciai: prezzi primo trimestre',
    date: at(-1, '14:00'),
    participants: ['Marco Ferraris', 'Agente Acciai del Piemonte'],
    summary:
      'Il fornitore propone un aumento del 3,5% dal primo gennaio. In alternativa blocca il prezzo attuale per sei mesi con un ordine quadro minimo di 180 tonnellate.',
    decisions: ['Nessuna decisione presa: risposta entro il 12 dicembre'],
    tasks: [
      { owner: 'Marco Ferraris', text: 'Decidere tra aumento e ordine quadro', due: at(11), status: 'open' },
      { owner: 'Laura Bianchi', text: 'Simulare l’impatto dell’ordine quadro sulla liquidità', due: at(4), status: 'open' },
    ],
    source: src('mtg-6', at(-1, '15:05')),
  },
];
