const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Ruta de registro
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Ruta de login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Buscar usuario
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        res.json({ 
            message: 'Login exitoso',
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;