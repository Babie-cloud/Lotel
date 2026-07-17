const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = 'change-moi-en-production'; 


function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
  }
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}


router.post('/register', async (req, res) => {
  try {
    const { email, password, confirm_password, first_name, last_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    if (confirm_password !== undefined && password !== confirm_password) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
    }

    const users = readUsers();
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      first_name: first_name || '',
      last_name: last_name || '',
    };

    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign({ sub: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '2h',
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    });
  } catch (err) {
    console.error('[Register] Erreur serveur', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const users = readUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '2h',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    console.error('[Login] Erreur serveur', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;