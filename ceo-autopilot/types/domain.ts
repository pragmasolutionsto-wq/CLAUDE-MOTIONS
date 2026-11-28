// Tipi di dominio di CEO AUTOPILOT.
// Sono il contratto tra interfaccia e livello dati: oggi li riempiono i mock, domani il backend.

export type Domain =
  | 'finance'
  | 'sales'
  | 'mail'
  | 'agenda'
  | 'meetings'
  | 'grants'
  | 'risk'
  | 'health';
export type Severity = 'high' | 'medium' | 'low';
export type Confidence = 'high' | 'medium' | 'low';

export type ConnectorId =
  | 'sdi'
  | 'bank_intesa'
  | 'bank_bper'
  | 'gmail'
  | 'gcal'
  | 'meetings'
  | 'wearable'
  | 'whatsapp_business'
  | 'grants';

export interface SourceRef {
  connector: ConnectorId;
  label: string; // "Intesa Sanpaolo"
  updatedAt: string; // ISO
  recordId?: string; // per aprire il dato originale
  period?: string; // "ultimi 90 giorni"
}

export type ActionKind =
  | 'draft_email'
  | 'reschedule'
  | 'delegate'
  | 'payment_reminder'
  | 'book_checkup'
  | 'block_time'
  | 'open_detail';

export interface ProposedAction {
  id: string;
  kind: ActionKind;
  label: string;
  payload: Record<string, unknown>;
  requiresApproval: true;
}

export type HwRuleId = 'HW1' | 'HW2' | 'HW3' | 'HW4' | 'HW5' | 'HW6' | 'HW7';

export interface Insight {
  id: string;
  domain: Domain;
  title: string; // una riga
  observedFact: string; // cosa è successo, con numeri
  hypothesis?: string; // interpretazione, sempre marcata come ipotesi
  suggestedAction?: ProposedAction;
  severity: Severity;
  confidence: Confidence;
  priorityScore: number; // 0-100, calcolato in lib/rules
  sources: SourceRef[];
  dueAt?: string;
  healthAdjusted?: boolean; // true se la salute ha cambiato priorità o tempistica
  // Estensioni rispetto alla specifica base
  healthReason?: string; // perché il recupero ha cambiato questo insight (tooltip del chip)
  hwRule?: HwRuleId; // regola del bridge che ha generato l'insight
  reliability: number; // 0-100: sotto soglia l'insight non entra nel briefing
  safetyRule?: boolean; // regola di sicurezza: vince sempre sul punteggio
  href?: string; // sezione dove vedere il dettaglio
}

export interface ReadinessSnapshot {
  score: number | null; // 0-100 relativo alla baseline personale, null se dati insufficienti
  vsBaseline: 'above' | 'in_range' | 'below' | 'well_below' | 'unknown';
  sleepHours: number | null;
  hrvMs: number | null;
  restingHr: number | null;
  validNights: number; // servono >= 14 notti per la baseline
  source: SourceRef;
}

export interface Briefing {
  date: string;
  greeting: string;
  readiness?: ReadinessSnapshot; // solo piano Health
  priorities: Insight[]; // max 3
  personalTip?: Insight; // max 1, dominio health
  dayShape: { meetingsHours: number; focusBlocks: number; firstFree: string | null };
  quietDay: boolean; // true = "oggi nessuna urgenza"
}

export interface CashflowItem {
  label: string;
  amount: number;
  kind: 'in' | 'out';
  estimated?: boolean;
  recordId?: string;
}

export interface CashflowWeek {
  weekStart: string;
  openingBalance: number;
  expectedIn: number;
  expectedOut: number;
  closingBase: number;
  closingPrudent: number; // incassi -20%, uscite +5%
  belowReserve: boolean; // scenario prudente sotto riserva
  belowReserveBase: boolean;
  items: CashflowItem[];
}

export interface Invoice {
  id: string;
  type: 'issued' | 'received';
  counterparty: string;
  number: string;
  issueDate: string;
  dueDate: string;
  amount: number; // totale documento, IVA inclusa
  vat: number; // di cui IVA
  paid: number;
  paidDate?: string;
  status: 'paid' | 'open' | 'overdue' | 'partial';
  daysOverdue?: number;
}

export interface BankAccount {
  id: 'bank_intesa' | 'bank_bper';
  bank: string;
  name: string;
  ibanMasked: string;
  balance: number;
  creditLine?: number;
  creditUsed?: number;
}

export interface BankTransaction {
  id: string;
  accountId: BankAccount['id'];
  date: string;
  description: string;
  amount: number; // positivo = entrata
  invoiceId?: string; // riconciliazione: presente = abbinato
  category: 'incasso' | 'fornitore' | 'stipendi' | 'imposte' | 'leasing' | 'spese' | 'altro';
}

export interface MailThread {
  id: string;
  channel: 'mail' | 'whatsapp';
  from: string;
  org?: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  bucket: 'todo' | 'waiting' | 'noise';
  urgencyReason?: string;
  draftReply?: string;
  messages: number;
}

export type EventCategory = 'operativo' | 'strategico' | 'clienti' | 'interno' | 'personale';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  category: EventCategory;
  kind: 'meeting' | 'block' | 'personal';
  participants: string[];
  external: boolean;
  counterparty?: string; // cliente o ente, per "Prepara la riunione"
  recurring?: boolean;
  ownerIsDecider: boolean;
  importance: Severity;
  irreversibleDecision?: boolean;
  location?: string;
}

export interface MeetingTask {
  owner: string;
  text: string;
  due: string;
  status: 'open' | 'done' | 'overdue';
}

export interface MeetingSummary {
  id: string;
  title: string;
  date: string;
  participants: string[];
  summary: string;
  decisions: string[];
  tasks: MeetingTask[];
  source: SourceRef;
}

export interface Grant {
  id: string;
  title: string;
  issuer: string;
  level: 'UE' | 'nazionale' | 'regionale' | 'comunale';
  deadline: string;
  amountRange: string;
  fitScore: number;
  fitReasons: string[];
  missingRequirements: string[];
  url: string;
}

export interface DecisionOption {
  label: string;
  pros: string[];
  cons: string[];
  risks: string[];
}

export interface Decision {
  id: string;
  question: string;
  createdAt: string;
  options: DecisionOption[];
  missingInfo: string[];
  chosen?: string;
  rationale?: string;
  reviewAt?: string;
  outcome?: string;
  readinessAtDecision?: number | null;
}

export interface ConnectorLog {
  at: string;
  ok: boolean;
  note: string;
}

export interface ConnectorStatus {
  id: ConnectorId;
  name: string;
  provider: string;
  state: 'connected' | 'not_connected' | 'error' | 'consent_expiring';
  lastSync?: string;
  consentExpiresAt?: string;
  reads: string[];
  doesNotRead: string[];
  privateDomain: boolean; // true per wearable
  logs: ConnectorLog[];
  note?: string;
}

export interface HealthDay {
  date: string; // giorno del risveglio
  sleepHours: number | null;
  hrvMs: number | null;
  restingHr: number | null;
  steps: number | null;
  valid: boolean; // notte valida ai fini della baseline
}

export interface WorkloadDay {
  date: string;
  meetingHours: number;
  mailsReceived: number;
}

export interface Company {
  name: string;
  city: string;
  province: string;
  sector: string;
  employees: number;
  revenue: number;
  website: string;
  liquidityReserve: number;
  kmFromRivoli: number;
  owner: { firstName: string; lastName: string; age: number; wearable: string };
  people: { name: string; role: string }[];
}

export type Plan = 'business' | 'health';
export type Role = 'owner' | 'assistant';

/** Esito di una lettura dati: mai uno zero finto, sempre il motivo se manca. */
export type Avail<T> =
  | { status: 'ok'; data: T; stale?: StaleInfo }
  | { status: 'missing'; reason: string; connector: ConnectorId; cta: string };

export interface StaleInfo {
  connector: ConnectorId;
  label: string;
  since: string; // ultimo dato valido
  error: boolean; // true = connettore in errore, false = solo dato vecchio
}
