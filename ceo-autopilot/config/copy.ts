// Testi ricorrenti e sensibili del prodotto, raccolti qui per poterli rivedere in un colpo solo.
// Regole: si dà del tu, frasi brevi, niente punti esclamativi, niente emoji.
// Area salute: mai termini clinici, mai colpevolizzare.

export const COPY = {
  brand: 'CEO AUTOPILOT',
  by: 'by Longevitas',
  claim: 'La tua azienda. La tua energia. Una sola torre di controllo.',

  notAvailable: 'Non disponibile',
  staleBadge: 'Dato non aggiornato',
  privateBadge: 'Privato · solo tu',
  quietDay: 'Oggi nessuna urgenza. Le fonti sono aggiornate. Buon lavoro.',
  hypothesis: 'Ipotesi',
  healthAdjustedChip: 'Adattato al tuo recupero',

  readiness: {
    tooltip: 'Confronto con i tuoi valori abituali. Non è una valutazione clinica.',
    bands: {
      above: 'Recupero sopra la tua media. Buona giornata per le cose difficili.',
      in_range: 'Recupero nella tua media.',
      below: 'Recupero sotto la tua media. Tieni un po’ di margine.',
      well_below: 'Recupero sotto la tua media. Giornata da gestire con attenzione.',
      unknown: 'Sto ancora imparando i tuoi valori.',
    },
    bandLabel: {
      above: 'Sopra la tua media',
      in_range: 'Nella tua media',
      below: 'Sotto la tua media',
      well_below: 'Molto sotto la tua media',
      unknown: 'In apprendimento',
    },
    learning: (n: number, min: number) => `Sto ancora imparando i tuoi valori (${n}/${min} notti)`,
  },

  health: {
    onlyYou: 'Questi dati li vedi solo tu.',
    disclaimer:
      'CEO AUTOPILOT non sostituisce il medico e non dà valutazioni cliniche. In caso di emergenza chiama il 112.',
    urgentTitle: 'Se sei in pericolo adesso, chiama il 112',
    urgentBody:
      'Quello che hai scritto merita attenzione subito. Chiama il 112 o contatta ora un professionista. Non restare da solo con questa cosa.',
    reportNote: 'I referti non vengono interpretati dal software. Li commenta il tuo medico.',
    ownerOnly: 'Quest’area è riservata al titolare.',
  },

  grants: {
    disclaimer: 'Compatibilità stimata. L’ammissibilità va verificata con il tuo consulente.',
  },

  invoices: {
    note: 'Le spese senza fattura elettronica e alcune fatture estere non compaiono qui: caricale a mano o le riconciliamo dalla banca.',
  },

  whatsapp: {
    onlyBusiness:
      'Si collega solo il numero WhatsApp Business dell’azienda. Le chat personali restano private e non sono accessibili.',
  },

  readOnly: 'Sola lettura. Il sistema propone, tu decidi: niente parte senza la tua conferma.',

  missing: {
    bank: 'Banca non collegata',
    sdi: 'Fatture elettroniche non collegate',
    gmail: 'Mail non collegata',
    gcal: 'Calendario non collegato',
    meetings: 'Riunioni non collegate',
    wearable: 'Wearable non collegato',
    whatsapp_business: 'WhatsApp Business non collegato',
    grants: 'Ricerca bandi non collegata',
  },
} as const;

export const CONNECTOR_CTA: Record<string, string> = {
  sdi: 'Collega le fatture',
  bank_intesa: 'Collega la banca',
  bank_bper: 'Collega la banca',
  gmail: 'Collega la mail',
  gcal: 'Collega il calendario',
  meetings: 'Collega le riunioni',
  wearable: 'Collega il wearable',
  whatsapp_business: 'Collega WhatsApp Business',
  grants: 'Attiva la ricerca bandi',
};
