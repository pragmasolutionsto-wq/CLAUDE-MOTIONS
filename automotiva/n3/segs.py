# Golf GTI Performance 2019: tagli (clip, in, out[, opzioni]) in secondi sorgente, al frame (1/30 s)
# M = solo immagine (muta); NAT = audio originale in primo piano (scarico), con la musica in silenzio
M = lambda r=1.0: dict(mute=True, rate=r)
NAT = dict(nat=True)
SEGS = [
    ('9872', 0.9667, 3.1333),     # una Golf così non la trovi due volte
    ('9872', 3.2667, 5.0),        # e non è quella del tuo vicino
    ('9872', 5.0667, 5.4667),     # vieni
    ('9872', 6.0, 7.3),           # è una GTI
    ('9855', 0.6, 1.5667, M()),   # stacco a tempo: frontale con i fari accesi
    ('9857', 0.6, 1.5667, M()),   # stacco a tempo: posteriore
    ('9873', 1.9333, 2.9667),     # il filo rosso
    ('9873', 3.3333, 4.4333),     # fari full LED
    ('9875', 1.4333, 2.6333),     # 19 pollici
    ('9875', 2.9333, 7.4667),     # diamantati, bicolore, le pinze freno rosse che gridano GTI
    ('9877', 1.5, 6.2),           # questa GTI Performance è del 2019, ha 81.000 km
    ('9877', 6.5667, 8.1667),     # e il filo rosso continua
    ('9878', 0.8667, 2.2667),     # il suo bel battitacco
    ('9878', 2.5, 5.4),           # i suoi interni in pelle totale
    ('9878', 6.5667, 8.9333),     # volante sportivo in pelle multifunzione
    ('9880', 0.8667, 2.6667),     # 245 cavalli
    ('9880', 2.9333, 6.8),        # quell'aria da "faccio il bravo in città", ma se mi provochi...
    ('9896', 2.9, 5.1, NAT),      # ...lo scarico risponde (musica in silenzio)
    ('9883', 0.8, 2.1667),        # cambio DSG
    ('9883', 2.9333, 4.0),        # puoi bere il caffè
    ('9888', 1.5667, 2.8333),     # come dice Davide
    ('9888', 3.6333, 8.0333),     # l'infotainment centrale, l'info display, ha un sacco di tasti
    ('9888', 8.2, 9.75),          # ha tutto quello che ci serve
    ('9888', 11.5333, 12.5),      # retrocamera
    ('9889', 2.7, 4.0333),        # ho trovato ancora un altro
    ('9889', 5.8, 7.7667),        # accessorio molto interessante
    ('9889', 8.2333, 9.0),        # guardate
    ('9889', 9.4, 10.7333),       # anche il tettuccio apribile
    ('9889', 11.1333, 12.0667),   # e funziona
    ('9891', 0.7333, 3.4),        # abbiamo ancora un'altra caratteristica su questa Golf
    ('9891', 4.6, 5.9333),        # (silenzio) non mi vedete?
    ('9891', 7.3667, 10.2),       # eh, perché i vetri sono oscurati (si abbassa il finestrino)
    ('9895', 2.7, 5.9667),        # noi vi abbiamo provocato con questi 245 cavalli
    ('9895', 6.9, 8.1667),        # venite a trovarci
    ('9895', 9.0, 9.9667),        # scriveteci
    ('9895', 12.6667, 15.2),      # e non compratela: la vogliamo tenere qui
    ('9896', 8.3, 10.75, NAT),    # sgasata finale (musica in silenzio)
]
