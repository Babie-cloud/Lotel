require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
const serverless = require('serverless-http');
const path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const connectDB = require('./db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var hotelRouter = require('./routes/hotel');
var paymentRouter = require('./routes/payment');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const allowedOrigins = ['http://localhost:4200', 'https://lotel.netlify.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par CORS'));
    }
  },
  credentials: true,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB avant de traiter chaque requête (sans reconnecter si déjà connecté)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB] Erreur de connexion', err);
    res.status(500).json({ message: 'Database connection error.' });
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api', hotelRouter);
app.use('/api/payment', paymentRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
module.exports.handler = serverless(app);