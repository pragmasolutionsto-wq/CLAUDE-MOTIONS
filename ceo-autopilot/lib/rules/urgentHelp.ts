import { URGENT_HELP_KEYWORDS } from '@/config/thresholds';

/**
 * Controllo semplice su parole chiave: se il testo indica un pericolo immediato
 * l'interfaccia mostra il banner fisso con il 112. Nel prodotto reale va sostituito
 * da un classificatore validato con i medici Longevitas.
 */
export function detectUrgentHelp(text: string): boolean {
  const t = text.toLowerCase();
  return URGENT_HELP_KEYWORDS.some((k) => t.includes(k));
}
