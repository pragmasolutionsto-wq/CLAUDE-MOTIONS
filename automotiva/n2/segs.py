# Audi A3 Sportback Identity Black 2024 (bianca): tagli (clip, in, out[, opzioni]) in secondi sorgente, al frame (1/30 s)
# bordi da refine.py; M = solo immagine (muta), con eventuale velocità
M = lambda r=1.0: dict(mute=True, rate=r)
SEGS = [
    ('9742', 0.1667, 3.4),       # un'Audi A3 come questa non la trovi più
    ('9733', 1.0, 1.9667, M()),  # stacco a tempo: frontale
    ('9735', 0.6, 1.5667, M()),  # stacco a tempo: fiancata
    ('9747', 1.0333, 6.9667),    # Audi A3 35 TFSI MHEV, quindi mild hybrid, non col cavetto
    ('9749', 0.3, 1.5667),       # bianco perla
    ('9752', 0.0, 1.0667),       # fari full LED
    ('9754', 0.1667, 2.5667),    # non sempre le misure non contano
    ('9754', 3.5333, 5.3),       # Audi Sport da 19
    ('9759', 0.1333, 5.3667),    # quante Audi A3 trovate in giro che siano sia S line esterno che interno?
    ('9760', 0.0, 1.5),          # (sketch, seduto dietro) ha una guida pazzesca
    ('9760', 2.1333, 4.0),       # eh... eh no
    ('9760', 4.0, 5.7, M(1.5)),  # la camera svela che è sul sedile dietro
    ('9761', 0.0, 3.2667),       # come dicevo, ha una guida pazzesca
    ('9761', 3.9333, 7.3333),    # volante traforato, S line, logato
    ('9764', 1.4333, 3.9333),    # dotazioni della vettura: cruise control
    ('9764', 5.4, 9.7),          # tanti tasti, palette al volante, tante cose sul monitor (tolto l'inciampo finale)
    ('9765', 0.5, 2.0, M(1.25)), # si alza verso il tetto
    ('9768', 0.6, 1.9333),       # tettuccio apribile
    ('9772', 0.4, 2.9333),       # anche se non ho mai capito bene a cosa serva
    ('9772', 3.7333, 6.1333),    # c'è una chicca, guardate che magia
    ('9772', 7.6667, 8.6),       # voilà
    ('9772', 10.0, 11.3667),     # portellone elettrico
    ('9774', 1.0667, 5.8667),    # e oltre ad essere un S line è anche Identity Black
    ('9775', 0.0, 1.1667),       # introvabile
    ('9777', 0.2333, 2.8667),    # 26.000 sono i chilometri, non il prezzo
    ('9777', 3.8, 6.6667),       # con 7-8 mila euro in più forse ve la portate a casa
    ('9777', 8.4, 10.2333),      # ciao, vieni a vederla
]
