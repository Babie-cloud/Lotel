const express = require('express');
const router = express.Router();
const hotels = require('./hotels.json');

router.get('/hotels', (req, res) => {
  res.json(hotels);
});


router.get('/hotel-search', (req, res) => {
  const { ville, codePostal, dateDebut, dateFin, personnes } = req.query;
  let resultats = hotels;

  if (ville) {
    resultats = resultats.filter(h =>
      h.ville.toLowerCase() === ville.toLowerCase()
    );
  }

  if (codePostal) {
    resultats = resultats.filter(h => h.codePostal === codePostal);
  }

  if (personnes) {
    const nbPersonnes = parseInt(personnes, 10);
    resultats = resultats.filter(h => h.chambresDisponibles > 0);
  }

  res.json(resultats);
});

router.get('/hotels/:id', (req, res) => {
  const hotel = hotels.find(h => h.id === parseInt(req.params.id));
  if (!hotel) return res.status(404).json({ message: 'Hôtel non trouvé' });
  res.json(hotel);
});

module.exports = router;