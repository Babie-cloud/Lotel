const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  hotelId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  nombrePersonnes: { type: Number, required: true },
  nombreChambres: { type: Number, required: true },
  statutPaiement: {
    type: String,
    enum: ['en_attente', 'paye', 'annule'],
    default: 'en_attente',
  },
  stripePaymentIntentId: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
