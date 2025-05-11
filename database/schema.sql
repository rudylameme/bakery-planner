-- Table Points de Vente
CREATE TABLE pdv (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL
);

-- Table Fréquentation
CREATE TABLE frequentation (
    id SERIAL PRIMARY KEY,
    pdv_id INTEGER REFERENCES pdv(id),
    semaine INTEGER NOT NULL, -- numéro de semaine
    jour VARCHAR(10) NOT NULL, -- Lundi, Mardi, etc.
    tranche_horaire VARCHAR(20) NOT NULL, -- Matin, Après-midi
    tickets_sem1 INTEGER NOT NULL, -- S-1
    tickets_sem1a1 INTEGER NOT NULL, -- S-1A-1
    tickets_sem2 INTEGER NOT NULL, -- S-2
    UNIQUE(pdv_id, semaine, jour, tranche_horaire)
);

-- Table Historique Ventes
CREATE TABLE historique_ventes (
    id SERIAL PRIMARY KEY,
    pdv_id INTEGER REFERENCES pdv(id),
    date DATE NOT NULL,
    produit VARCHAR(100) NOT NULL,
    quantite INTEGER NOT NULL
);

-- Table Réglages PDV
CREATE TABLE reglages_pdv (
    id SERIAL PRIMARY KEY,
    pdv_id INTEGER REFERENCES pdv(id),
    produit VARCHAR(100) NOT NULL,
    alias_produit VARCHAR(100),
    seuil_min INTEGER NOT NULL DEFAULT 0,
    seuil_max INTEGER NOT NULL DEFAULT 100,
    monitore BOOLEAN NOT NULL DEFAULT true,
    poids_sem1 FLOAT NOT NULL DEFAULT 0.5, -- S-1
    poids_sem1a1 FLOAT NOT NULL DEFAULT 0.3, -- S-1A-1
    poids_sem2 FLOAT NOT NULL DEFAULT 0.2, -- S-2
    UNIQUE(pdv_id, produit)
);
