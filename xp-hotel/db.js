const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI manquant dans les variables d\'environnement.');
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log('MongoDB connecté');
}

module.exports = connectDB;