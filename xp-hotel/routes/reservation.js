const express = require('express');
const router = express.Router();
const hotels = require('./hotels.json');

// Pour la recherche des hôtels
router.get('/hotels/search', (req, res) => {
  try {
    const { ville, codePostal, personnes } = req.query;

    let resultats = hotels;

    if (ville) {
      resultats = resultats.filter((h) =>
        h.ville.toLowerCase().includes(ville.toLowerCase())
      );
    }
    if (codePostal) {
      resultats = resultats.filter((h) => h.codePostal === codePostal);
    }
    if (personnes) {
      const capacite = parseInt(personnes, 10);
      resultats = resultats.filter(
        (h) => !h.capaciteMax || h.capaciteMax >= capacite
      );
    }

    res.json(resultats);
  } catch (error) {
    console.error('Erreur lors de la recherche d\'hôtels :', error);
    res.status(500).json({ message: 'Erreur lors de la recherche', error: error.message });
  }
});

module.exports = router;