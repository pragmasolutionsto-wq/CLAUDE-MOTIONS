# Audi A3 Sportback 2026 (walkaround): tagli del parlato (clip, in, out) in secondi sorgente, allineati al frame (1/30 s)
# bordi da refine.py (inizio/fine voce reale -0.10/+0.14), rivisti a mano dove c'è una ripetizione o un respiro
SEGS = [
    ('9778', 1.8333, 7.3667),    # Audi A3 Sportback 1.5 TFSI con motore mild hybrid
    ('9779', 0.9667, 4.4333),    # i suoi 150 cavalli sono gestiti
    ('9779', 6.3333, 9.6),       # da un cambio automatico S tronic a sette rapporti
    ('9788', 0.9, 3.4667),       # i cerchi sono da 19 pollici
    ('9788', 4.8333, 8.2333),    # i fari sono full LED di nuova generazione
    ('9788', 9.1667, 13.1667),   # sensori di parcheggio anteriori, posteriori (senza 'tetto apribile': lo dice dopo)
    ('9789', 1.3333, 4.0667),    # S line esterno, S line interno (senza la ripetizione)
    ('9790', 0.0, 1.6667),       # abbiamo il battitacco illuminato
    ('9790', 3.4, 7.3667),       # sedili e volante in pelle e tessuto
    ('9792', 1.6333, 2.8667),    # l'infotainment
    ('9792', 3.5333, 6.5333),    # Apple CarPlay, Android Auto, navigazione (tolta la pausa)
    ('9792', 7.7667, 9.9),       # telecamera 360
    ('9792', 19.0333, 21.6),     # climatizzatore automatico a tre zone
    ('9792', 28.3667, 32.7),     # il volante è multifunzione, abbiamo anche le palette
    ('9792', 34.5667, 36.0667),  # cockpit digitale
    ('9793', 0.8333, 1.9333),    # ah, dimenticavo
    ('9793', 5.0333, 6.8),       # il tettuccio apribile
    ('9795', 0.4333, 2.8),       # un altro piccolo dettaglio, i chilometri
    ('9796', 4.1333, 6.8),       # sono meno di 7800
    ('9798', 1.8667, 5.3),       # è stata immatricolata nel giugno del 2026
    ('9798', 7.0333, 8.8),       # non ne trovate un'altra così
]
