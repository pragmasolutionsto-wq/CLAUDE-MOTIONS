// "Oggi" del prototipo. È fisso, così tutti i mock restano coerenti tra loro
// (settimana pesante, calo del recupero, scadenze) qualunque sia il giorno della demo.
// Quando arriva il backend questo file sparisce e si usa new Date().
export const DEMO_NOW = new Date(2026, 11, 1, 7, 15, 0); // martedì 1 dicembre 2026, 07:15

export type DayType = 'heavy' | 'normal' | 'quiet';
export type ConnectorScenario = 'all' | 'none' | 'bank_error';
export type BaselineScenario = 'complete' | 'learning';
