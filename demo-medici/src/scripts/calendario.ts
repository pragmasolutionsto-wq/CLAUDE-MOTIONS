// Calendario di richiesta prenotazione: giorno → orario → dati → invio (WhatsApp o mail già compilati).
type Cfg = { giorni: number[]; mattina: string[]; pomeriggio: string[]; settimane: number; wa: string; email: string; oggetto: string };

const sez = document.querySelector<HTMLElement>('[data-calendario]');
if (sez) {
  const cfg: Cfg = JSON.parse(sez.dataset.calendario || '{}');
  const $ = <T extends Element = HTMLElement>(s: string) => sez.querySelector<T>(s)!;
  const griglia = $('[data-griglia]');
  const meseEl = $('[data-mese]');
  const prec = $<HTMLButtonElement>('[data-mese-prec]');
  const succ = $<HTMLButtonElement>('[data-mese-succ]');
  const titoloGiorno = $('[data-giorno-titolo]');
  const orari = $('[data-orari]');
  const form = $<HTMLFormElement>('[data-form]');
  const riep = $('[data-riep-data]');
  const errore = $('[data-errore]');
  const fatto = $('[data-fatto]');
  const invio = $<HTMLAnchorElement>('[data-invio]');

  // "oggi" sovrascrivibile solo per i test (?oggi=AAAA-MM-GG)
  const qp = new URLSearchParams(location.search).get('oggi');
  const oggi = qp ? new Date(qp + 'T09:00:00') : new Date();
  oggi.setHours(0, 0, 0, 0);
  const primo = new Date(oggi); primo.setDate(primo.getDate() + 1);               // da domani
  const ultimo = new Date(oggi); ultimo.setDate(ultimo.getDate() + cfg.settimane * 7);

  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const pasqua = (y: number) => { // algoritmo di Gauss/Meeus
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
  };
  const festivi = new Set<string>();
  for (const y of [oggi.getFullYear(), oggi.getFullYear() + 1]) {
    ['01-01', '01-06', '04-25', '05-01', '06-02', '06-24', '08-15', '11-01', '12-08', '12-25', '12-26'].forEach((md) => festivi.add(`${y}-${md}`));
    const pm = pasqua(y); pm.setDate(pm.getDate() + 1); festivi.add(iso(pm)); // Pasquetta
  }
  const prenotabile = (d: Date) => d >= primo && d <= ultimo && cfg.giorni.includes(d.getDay()) && !festivi.has(iso(d));

  const fmtMese = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });
  const fmtLungo = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtBreve = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });

  let vista = new Date(primo.getFullYear(), primo.getMonth(), 1);
  let giorno: Date | null = null;
  let ora: string | null = null;

  const passo = (n: number) => sez.querySelectorAll<HTMLElement>('[data-passo]').forEach((li) => {
    const i = Number(li.dataset.passo); const c = li.querySelector('span')!;
    li.classList.toggle('text-ink', i <= n);
    c.className = 'grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ' + (i < n ? 'bg-brand2 text-white' : i === n ? 'bg-brand text-white' : 'border border-line bg-white');
    c.textContent = i < n ? '✓' : String(i + 1);
  });

  const aggiornaRiep = () => {
    riep.textContent = giorno && ora ? `${fmtLungo.format(giorno)}, ore ${ora}` : giorno ? `${fmtLungo.format(giorno)}: scelga l'orario` : 'Nessun orario scelto';
    passo(giorno && ora ? 1 : 0);
  };

  const disegnaOrari = () => {
    if (!giorno) { orari.classList.add('hidden'); return; }
    orari.classList.remove('hidden');
    titoloGiorno.textContent = fmtLungo.format(giorno).replace(/^./, (c) => c.toUpperCase());
    (['mattina', 'pomeriggio'] as const).forEach((k) => {
      const box = sez.querySelector<HTMLElement>(`[data-slot="${k}"]`);
      if (!box) return;
      box.innerHTML = '';
      cfg[k].forEach((h) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'slot'; b.textContent = h; b.dataset.ora = h;
        b.setAttribute('aria-pressed', String(h === ora));
        b.addEventListener('click', () => {
          ora = h;
          sez.querySelectorAll('.slot').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          aggiornaRiep(); errore.classList.add('hidden');
        });
        box.appendChild(b);
      });
    });
  };

  const disegnaMese = () => {
    meseEl.textContent = fmtMese.format(vista);
    griglia.innerHTML = '';
    const offset = (vista.getDay() + 6) % 7; // lunedì = 0
    for (let i = 0; i < offset; i++) griglia.appendChild(document.createElement('span'));
    const giorniMese = new Date(vista.getFullYear(), vista.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= giorniMese; n++) {
      const d = new Date(vista.getFullYear(), vista.getMonth(), n);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'giorno'; b.textContent = String(n); b.dataset.data = iso(d);
      b.setAttribute('aria-label', fmtLungo.format(d));
      if (iso(d) === iso(oggi)) b.dataset.oggi = '';
      if (!prenotabile(d)) b.disabled = true;
      b.setAttribute('aria-pressed', String(!!giorno && iso(d) === iso(giorno)));
      b.addEventListener('click', () => {
        giorno = d; ora = null;
        griglia.querySelectorAll('.giorno').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        disegnaOrari(); aggiornaRiep();
      });
      griglia.appendChild(b);
    }
    prec.disabled = vista <= new Date(primo.getFullYear(), primo.getMonth(), 1);
    succ.disabled = new Date(vista.getFullYear(), vista.getMonth() + 1, 1) > ultimo;
  };

  prec.addEventListener('click', () => { vista = new Date(vista.getFullYear(), vista.getMonth() - 1, 1); disegnaMese(); });
  succ.addEventListener('click', () => { vista = new Date(vista.getFullYear(), vista.getMonth() + 1, 1); disegnaMese(); });

  // Allinea motivo e sede con le scelte fatte nel box in alto
  document.querySelectorAll<HTMLElement>('[data-chip]').forEach((ch) => ch.addEventListener('click', () => {
    const sel = form.elements.namedItem(ch.dataset.chip === 'sede' ? 'sede' : 'motivo') as HTMLSelectElement | null;
    if (sel && ch.dataset.frase) sel.value = ch.dataset.frase;
  }));

  document.querySelector<HTMLSelectElement>('[data-sede-select]')?.addEventListener('change', (e) => {
    const sel = form.elements.namedItem('sede') as HTMLSelectElement | null;
    if (sel) sel.value = (e.target as HTMLSelectElement).value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    const campi = ['nome', 'telefono', 'email'].map((k) => form.elements.namedItem(k) as HTMLInputElement);
    campi.forEach((c) => c.removeAttribute('aria-invalid'));
    const errori: string[] = [];
    if (!giorno || !ora) errori.push('scelga giorno e orario nel calendario');
    if (v('nome').length < 3) { errori.push('indichi nome e cognome'); campi[0].setAttribute('aria-invalid', 'true'); }
    if (v('telefono').replace(/\D/g, '').length < 6) { errori.push('indichi un numero di telefono valido'); campi[1].setAttribute('aria-invalid', 'true'); }
    if (v('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) { errori.push("controlli l'indirizzo email"); campi[2].setAttribute('aria-invalid', 'true'); }
    if (!f.get('privacy')) errori.push("confermi di aver letto l'informativa privacy");
    if (errori.length) {
      errore.textContent = 'Per inviare la richiesta: ' + errori.join(', ') + '.';
      errore.classList.remove('hidden'); fatto.classList.add('hidden');
      if (!giorno || !ora) sez.querySelector('[data-griglia]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errore.classList.add('hidden');
    const dataLunga = fmtLungo.format(giorno!);
    const facoltativi = [v('email') && `Email: ${v('email')}`, v('note') && `Note: ${v('note')}`].filter(Boolean);
    const righe = [
      `Buongiorno Dottore, vorrei prenotare una visita per ${v('motivo')} presso ${v('sede')}.`,
      '',
      `Data e ora preferite: ${dataLunga}, ore ${ora}`,
      `Tipo di visita: ${v('tipo')}`,
      `Nome: ${v('nome')}`,
      `Telefono: ${v('telefono')}`,
      ...facoltativi,
    ];
    const testo = righe.join('\n');
    const oggetto = `${cfg.oggetto} – ${fmtBreve.format(giorno!)} ore ${ora}`;
    invio.href = cfg.wa
      ? `https://wa.me/${cfg.wa}?text=${encodeURIComponent(testo)}`
      : `mailto:${cfg.email}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(testo)}`;
    if (cfg.wa) { invio.target = '_blank'; invio.rel = 'noopener'; }
    invio.click();
    fatto.classList.remove('hidden');
    passo(2);
  });

  disegnaMese(); aggiornaRiep();
}
