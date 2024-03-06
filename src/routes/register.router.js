import Router from 'express';
import User from '../dao/models/user.model.js';
import { createHash } from '../utils.js';

const router = Router();

router.get('/', (req, res) => {
    const error = req.query.error;
    res.render('register', {
        titlePage: 'Register | Relojeria',
        error
    });
});

// Ruta para el registro de usuarios
router.post('/', async (req, res) => {
    try {
        const { name, email, password, isAdmin } = req.body;

        // Verifica si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect(`/?error=User already exists`);
        }

        // Crea y guarda el nuevo usuario
        const newUser = new User({ name, email, password: createHash(password), role: isAdmin ? 'admin' : 'user' });
        await newUser.save();

        // Guarda el nombre del usuario en la sesión y redirige a la página de login
        req.session.name = newUser.name;
        res.redirect('/login');
    } catch (error) {
        res.redirect('/?error=Error registering user');
    }
});

export default router;
