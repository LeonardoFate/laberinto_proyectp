const router = require('express').Router();
const User = require('../models/User');

// Guardar nuevo puntaje
router.post('/', async (req, res) => {
    try {
        const { userId, score } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.scores.push({ score });
        await user.save();

        res.json({ message: 'Puntuación guardada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener todos los puntajes
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, 'username scores');
        const allScores = users.flatMap(user => 
            user.scores.map(score => ({
                username: user.username,
                score: score.score,
                date: score.date
            }))
        ).sort((a, b) => b.score - a.score);

        res.json(allScores);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener puntajes de un usuario específico
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user.scores.sort((a, b) => b.score - a.score));
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;