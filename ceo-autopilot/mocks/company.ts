import type { Company } from '@/types/domain';

// Azienda fittizia di riferimento. Tutti i nomi di clienti e fornitori sono inventati.
export const company: Company = {
  name: 'Meccanica Ferraris S.r.l.',
  city: 'Grugliasco',
  province: 'TO',
  sector: 'Lavorazioni meccaniche di precisione',
  employees: 38,
  revenue: 6_400_000,
  website: 'www.meccanicaferraris.example',
  liquidityReserve: 120_000,
  kmFromRivoli: 6,
  owner: { firstName: 'Marco', lastName: 'Ferraris', age: 52, wearable: 'Garmin' },
  people: [
    { name: 'Laura Bianchi', role: 'Amministrazione' },
    { name: 'Giorgio Rosso', role: 'Produzione' },
    { name: 'Elena Conti', role: 'Commerciale' },
  ],
};

export const CUSTOMERS = {
  tecnoauto: 'Tecnoauto Group',
  alpi: 'Alpi Robotics',
  idraulica: 'Idraulica Nord',
  freni: 'Freni Padani S.p.A.',
  valsusa: 'Officine Valsusa',
  stampi: 'Stampi Canavese',
  motori: 'Motori Monviso',
  dora: 'Pneumatica Dora',
} as const;

export const SUPPLIERS = {
  acciai: 'Acciai del Piemonte',
  utensili: 'Utensileria Sabauda',
  energia: 'Energia Torino Nord',
  trasporti: 'Trasporti Alpini',
  lubrificanti: 'Lubrificanti Susa',
  studio: 'Studio Gallo Commercialisti',
  trattamenti: 'Trattamenti Termici Chivasso',
} as const;

export const ACCOUNTANT = { name: 'Dott. Stefano Gallo', email: 's.gallo@studiogallo.example' };
