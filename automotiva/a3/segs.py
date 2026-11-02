# Audi A3 Identity Black: tagli del parlato (clip, in, out) in secondi sorgente, allineati al frame (1/30 s)
# bordi presi alla fine/inizio della pausa dalla parte della parola tenuta (refine.py), poi rivisti a mano
SEGS = [
    ('9322', 0.0, 3.8),       # aspetta un attimo, una come questa...
    ('9353', 0.4667, 3.8),    # cosa ha di diverso (fine 'altre?' a 3.78)
    ('9353', 6.0667, 17.9),   # cerchi 19, full LED, identity black
    ('9355', 2.3, 3.7333),     # scarico nero lucido
    ('9329', 0.8667, 12.2),  # dicevamo, quindi, Audi A3 2024, 26.000 km
    ('9334', 3.0, 9.2667),    # sedili riscaldati misto pelle S line
    ('9339', 2.5, 13.0333),   # volante S line, palette, virtual cockpit
    ('9346', 0.8, 6.5667),    # tetto apribile (fine 'elettronicamente' a 6.50)
    ('9349', 1.9667, 9.2),    # dotata di un motore
    ('9351', 0.2, 2.9),       # 1.5 mhev
    ('9351', 7.4, 11.2),      # benzina 150 cavalli
    ('9363', 0.0, 6.0),       # spero vi sia piaciuta, DM
    ('9363', 10.5333, 11.8),  # è in vendita (senza 'eh?')
]
