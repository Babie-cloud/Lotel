const express = require('express');
const router = express.Router();
const hotels = require('./hotels.json');
const Reservation = require('../models/Reservation');

/** Règle métier : 1 chambre = 2 personnes */
const CAPACITE_PAR_CHAMBRE = 2;

function chambresNecessairesPour(nbPersonnes) {
  return Math.ceil(nbPersonnes / CAPACITE_PAR_CHAMBRE);
}

async function chambresReserveesPourPeriode(hotelId, dateDebut, dateFin) {
  const reservations = await Reservation.find({
    hotelId,
    statutPaiement: { $ne: 'annule' },
    dateDebut: { $lt: dateFin },
    dateFin: { $gt: dateDebut },
  });
  return reservations.reduce((total, r) => total + (r.nombreChambres || 0), 0);
}

router.get('/hotels', (req, res) => {
  res.json(hotels);
});

router.get('/hotel-search', async (req, res) => {
  try {
    const { ville, codePostal, dateDebut, dateFin, personnes } = req.query;
    let resultats = [...hotels];

    if (ville) {
      resultats = resultats.filter(
        (h) => h.ville.toLowerCase() === String(ville).toLowerCase()
      );
    }

    if (codePostal) {
      const cp = String(codePostal).trim();
      // Si une ville est sélectionnée, le CP doit appartenir à cette ville
      if (ville) {
        const cpsDeLaVille = hotels
          .filter((h) => h.ville.toLowerCase() === String(ville).toLowerCase())
          .map((h) => h.codePostal);
        if (!cpsDeLaVille.includes(cp)) {
          return res.json([]);
        }
      }
      resultats = resultats.filter((h) => h.codePostal === cp);
    }

    const nbPersonnes = personnes ? parseInt(personnes, 10) : null;
    const hasDates = Boolean(dateDebut && dateFin);

    if (hasDates) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || fin <= debut) {
        return res.status(400).json({
          message: 'La date de fin doit être après la date de début.',
        });
      }
    }

    const resultatsAvecDisponibilite = await Promise.all(
      resultats.map(async (hotel) => {
        let chambresRestantes = hotel.chambresDisponibles;
        const messages = [];
        let chambresNecessaires = null;

        if (hasDates) {
          const debut = new Date(dateDebut);
          const fin = new Date(dateFin);
          const chambresReservees = await chambresReserveesPourPeriode(
            hotel.id,
            debut,
            fin
          );
          chambresRestantes = Math.max(
            0,
            hotel.chambresDisponibles - chambresReservees
          );

          if (chambresRestantes <= 0) {
            messages.push('Aucune chambre disponible pour ces dates.');
          }
        }

        // Règle : 1 chambre = 2 personnes
        // Pas assez d'espace si chambres < personnes / 2
        if (nbPersonnes && !Number.isNaN(nbPersonnes) && nbPersonnes > 0) {
          chambresNecessaires = chambresNecessairesPour(nbPersonnes);

          if (chambresRestantes < nbPersonnes / 2) {
            messages.push(
              `Il n'y a pas assez d'espaces : ${nbPersonnes} personne(s) nécessitent ` +
                `${chambresNecessaires} chambre(s), seulement ${chambresRestantes} disponible(s).`
            );
          }
        }

        return {
          ...hotel,
          capaciteParChambre: CAPACITE_PAR_CHAMBRE,
          chambresRestantes,
          chambresNecessaires,
          placesRestantes: chambresRestantes * CAPACITE_PAR_CHAMBRE,
          disponible: messages.length === 0,
          messages,
        };
      })
    );

    // Avec filtre personnes/dates : on montre les hôtels, y compris ceux sans assez d'espace
    // (bouton désactivé + message), pour que l'utilisateur comprenne pourquoi.
    res.json(resultatsAvecDisponibilite);
  } catch (err) {
    console.error('[hotel-search] Erreur', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/hotels/:id', (req, res) => {
  const hotel = hotels.find((h) => h.id === parseInt(req.params.id, 10));
  if (!hotel) return res.status(404).json({ message: 'Hôtel non trouvé' });
  res.json(hotel);
});

module.exports = router;
