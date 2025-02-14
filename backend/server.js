// server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Para debug - verificar las variables de entorno
console.log('Variables de entorno cargadas:', {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT
});

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB con URI explícita si la variable de entorno falla
const mongoURI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/laberinto?authSource=admin';

// Conexión a MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Importar rutas
const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});