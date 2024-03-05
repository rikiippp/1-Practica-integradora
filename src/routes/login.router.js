import Router from 'express';
import User from '../dao/models/user.model.js';

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

// Ruta para registrarse
router.post('/submit', async (req, res) => {
    try {
        const { email, password, name, isAdmin } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const newUser = new User({ email, password, name, isAdmin });
        await newUser.save();

        // Redirige al usuario a la página de login después de registrarse
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error submitting registration form' });
    }
});


// Ruta para el login
router.get('/login', (req, res) => {
    try {
        res.render('login', {
            titlePage: 'Login | Relojeria'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error rendering login page' });
    }
});

// Ruta para iniciar sesión
router.post('/login/submit', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
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
        console.error(error);
        res.status(500).json({ error: 'Error submitting login form' });
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
            res.status(404).send({ error: "No hay cookie" });
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
    // Asegurarse de que estamos accediendo al rol correcto de la sesión
    const role = req.session.role;
    res.send(`¡Bienvenido al panel de administracion, tu rol es ${role}!`);
});

export default router;
