import Router from 'express';
import User from '../dao/models/user.model.js';
import { isValidPassword } from '../utils.js';

const router = Router();

// Middleware para verificar el rol
const checkRole = (role) => {
    return (req, res, next) => {
        if (req.session.role === role) {
            next();
        } else {
            res.redirect('/login');
        }
    };
};

// Ruta para el login
router.get('/login', (req, res) => {
    try {
        const error = req.query.error;
        res.render('login', {
            titlePage: 'Login | Relojeria',
            error
        });
    } catch (error) {
        res.status(500).json({ error: 'Error rendering login page' });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!email || !password) {
            return res.redirect('/login?error=Incomplete values');
        }

        if (!user) {
            return res.redirect('/login?error=User not found');
        }

        // Verifica si la contraseña es correcta
        if (!isValidPassword(user, password)) {
            return res.redirect('/login?error=Incorrect password');
        }

        // Establece la cookie al iniciar sesión
        res.cookie('user', { email: user.email, name: user.name, role: user.role }, { maxAge: 100000 });

        // Establece la información del usuario en la sesión
        req.session.name = user.name;
        req.session.role = user.role;

        // Verifica si el usuario es administrador
        if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
            req.session.role = 'admin';
            req.session.name = user.name;
            res.redirect('/admin'); // Redirige al panel de administración
        } else {
            req.session.role = 'user';
            req.session.name = user.name;
            res.redirect('/products'); // Redirige a la página de productos
        }
    } catch (error) {
        res.redirect('/login?error=Failed to login');
    }
});

// Ruta para obtener la cookie
router.get('/getCookie', (req, res) => {
    try {
        // Intenta obtener la cookie 
        const userCookie = req.cookies.user;

        if (userCookie) {
            // Si la cookie existe, envia los datos como respuesta
            const { email, name, role } = userCookie;
            res.send({ email, name, role });
        } else {
            // Si la cookie no existe, envía un mensaje de error
            res.status(404).send({ error: "There is no cookie" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error fetching cookie' });
    }
});

// Ruta para logout
router.get('/logout', (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/login');
            }
            res.clearCookie('user');
            res.redirect('/login');
        });
    } catch (error) {
        res.status(500).json({ error: 'Error logging out' });
    }
});

// Ruta para el administrador
router.get('/admin', checkRole('admin'), (req, res) => {
    const { role, name } = req.session;
    res.send(`Welcome ${name} to the administration panel, your role is ${role}!`);
});

export default router;
