import Router from 'express';
import User from '../dao/models/user.model.js';

const router = Router();

router.get('/', (req, res) => {
    res.render('register', {
        titlePage: 'Register | Relojeria'
    });
});

// Ruta para el registro de usuarios
router.post('/', async (req, res) => {
    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: 'usuario'
        });

        await newUser.save();
        req.session.name = newUser.name; // Guarda el nombre del usuario en la sesión
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Error al registrar el usuario');
    }
});


export default router;