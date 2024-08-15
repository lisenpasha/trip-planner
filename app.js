const express = require('express');
const mongoose = require('mongoose');
const tripRoutes = require('./routes/tripRoutes');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

require('dotenv').config();
const app = express();

//This middleware helps to sanitize user input to prevent NoSQL injection attacks
app.use(mongoSanitize());

// xss-clean middleware to sanitize user input from POST body, GET queries, and url params to prevent XSS attacks
app.use(xss());

// helmet to help secure our  app by setting various HTTP headers
app.use(helmet());

// limits repeated requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(limiter);

// protects against HTTP parameter pollution attacks
app.use(hpp());

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/trips', tripRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = app;
