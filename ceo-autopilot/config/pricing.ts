import type { Plan } from '@/types/domain';

// Unica fonte dei prezzi. Sono ancora da validare: non scriverli mai dentro i componenti.
export interface PlanConfig {
  id: Plan;
  name: string;
  priceYear: number; // euro, IVA esclusa
  vatNote: string;
  recommended: boolean;
  tagline: string;
  features: string[];
}

export const PLANS: Record<Plan, PlanConfig> = {
  business: {
    id: 'business',
    name: 'Business',
    priceYear: 1490,
    vatNote: '+ IVA, pagamento annuale',
    recommended: false,
    tagline: 'Il copilot completo per la tua azienda.',
    features: [
      'Briefing ogni mattina in 60 secondi',
      'Mail, agenda e riunioni in ordine',
      'Liquidità a 13 settimane, incassi e fatture',
      'Bandi compatibili con la tua azienda',
      'Decision Room con registro delle decisioni',
    ],
  },
  health: {
    id: 'health',
    name: 'Business + Health',
    priceYear: 2490,
    vatNote: '+ IVA, pagamento annuale',
    recommended: true,
    tagline: 'La tua azienda e la tua energia, in una sola torre di controllo.',
    features: [
      'Tutto il piano Business',
      'Wearable integrato (Garmin, Oura, Whoop, Fitbit, Polar, Apple Watch)',
      'Incrocio tra carico di lavoro e recupero',
      'Check-up Longevitas ogni 6 mesi, in clinica a Rivoli o in telemedicina',
      'Consulti in video con i medici Longevitas',
    ],
  },
};

export const CLINIC_PRICING = {
  // Il consulto in telemedicina può essere incluso nel piano Health oppure a pagamento.
  teleconsultIncluded: true,
  teleconsultPrice: 90,
  teleconsultMinutes: 20,
  checkupsPerYear: 2,
  // Entro questa distanza dalla clinica la visita in sede è la prima scelta.
  clinicFirstChoiceKm: 80,
};

export const RENEWAL = {
  renewalDate: '2027-09-15',
  guarantee:
    'Garanzia soddisfatti o rimborsati nei primi 30 giorni (testo segnaposto, da validare).',
};
