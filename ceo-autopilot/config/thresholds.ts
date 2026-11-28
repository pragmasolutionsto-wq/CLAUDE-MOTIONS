// Tutte le soglie delle regole deterministiche. Niente numeri sparsi nel codice.

export const PRIORITY = {
  // priority = 0.40*gravità + 0.30*urgenza + 0.20*impatto_obiettivo + 0.10*affidabilità
  weights: { severity: 0.4, urgency: 0.3, goalImpact: 0.2, reliability: 0.1 },
  // Sotto questa affidabilità l'insight non entra nel briefing (resta nella sua sezione).
  minReliabilityForBriefing: 40,
  maxBusinessPriorities: 3,
  maxPersonalTips: 1,
  severityScore: { high: 90, medium: 60, low: 30 },
  reliabilityByConfidence: { high: 90, medium: 65, low: 35 },
  // Urgenza in base ai giorni alla scadenza.
  urgency: { today: 100, within2d: 85, within7d: 65, within14d: 45, within30d: 30, later: 15 },
} as const;

export const CASHFLOW = {
  weeks: 13,
  // Scenario prudente: incassi -20%, uscite +5%.
  prudentInFactor: 0.8,
  prudentOutFactor: 1.05,
} as const;

export const RECEIVABLES = {
  agingBuckets: [30, 60, 90] as const, // 0–30, 31–60, 61–90, oltre 90
  // Importo minimo scaduto per cliente sopra cui proporre un sollecito.
  minReminderAmount: 5000,
  concentrationTopN: 3,
  // Oltre questa quota i primi 3 clienti sono un rischio di concentrazione.
  concentrationWarn: 0.6,
} as const;

export const READINESS = {
  baselineWindowDays: 28, // mediana mobile personale
  minValidNights: 14, // sotto questa soglia score = null
  // Con valori uguali alla baseline lo score è al centro della fascia "nella norma".
  neutralScore: 65,
  weights: { sleep: 0.4, hrv: 0.4, restingHr: 0.2 },
  // Quanto pesa uno scostamento relativo dalla baseline (sensibilità per metrica).
  sensitivity: { sleep: 1.2, hrv: 1.5, restingHr: 2.0 },
  bands: { above: 75, inRange: 55, below: 40 }, // >=75 sopra, 55–74 nella norma, 40–54 sotto, <40 molto sotto
} as const;

export const BRIDGE = {
  hw1: { minMeetingHours: 5, maxToMove: 2 },
  hw2: { withinHours: 48, lookAheadDays: 5 },
  hw3: { consecutiveNights: 3, hoursBelowBaseline: 1 },
  hw4: { weeklyHours: 28, weeks: 3, maxToDelegate: 3 },
  hw5: { lowDays: 10, windowDays: 14 },
  hw6: { dueWithinDays: 30 },
  hw7: { minFreeBlockMin: 60, workingDays: 3, proposedBlockMin: 90 },
  // Ordine con cui si sceglie l'unico suggerimento personale del giorno.
  tipOrder: ['HW1', 'HW5', 'HW3', 'HW2', 'HW7', 'HW4', 'HW6'] as const,
  workdayStartHour: 9,
  workdayEndHour: 18,
} as const;

export const STALENESS_HOURS = {
  // Oltre queste soglie il dato è "non aggiornato" e non genera alert assertivi.
  gcal: 24,
  bank_intesa: 48,
  bank_bper: 48,
  sdi: 24 * 7,
  gmail: 24,
  meetings: 24 * 7,
  wearable: 36,
  whatsapp_business: 24,
  grants: 24 * 7,
} as const;

// Parole che, scritte nella Decision Room, fanno comparire il banner con il 112.
export const URGENT_HELP_KEYWORDS = [
  'farla finita',
  'non ce la faccio più',
  'togliermi la vita',
  'uccidermi',
  'suicid',
  'dolore al petto',
  'non respiro',
  'sto per svenire',
  'farmi del male',
] as const;

export const DEFAULT_USER_THRESHOLDS = {
  liquidityReserve: 120000,
  minReminderAmount: 5000,
  meetingHoursWarn: 28,
};
