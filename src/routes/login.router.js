import Router from 'express';
import User from '../dao/models/user.model.js';
import { createHash } from '../utils.js';
import passport from 'passport';


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
router.post('/login', passport.authenticate('login', {
    failureRedirect: '/login?error=Login failed'
}), async (req, res) => {
    // Establezco la session
    req.session.user = req.user;
    console.log('session', req.session.user)

    // Establezco la cookie 
    res.cookie('user', { email: req.user.email, first_name: req.user.first_name, role: req.user.role });

    res.redirect('/products'); // Redirecciona al main si esta todo correcto
});


// Rutas de autenticación
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { });

// Ruta del callback
router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    async (req, res) => {
        // Extraigo la información necesaria del objeto req.user
        const { displayName: username, first_name, role } = req.user;

        // Ahora que tengo los datos podemos establecer la sesión
        req.session.user = {
            username,
            first_name,
            role
        };
        // Establecemos la cookie con la información del usuario
        res.cookie('user', { email: req.user.email, first_name: first_name, role: role });

        // Redireccionamos al usuario a la página de productos
        res.redirect('/products');
    });


// Ruta para obtener la cookie
router.get('/getCookie', (req, res) => {
    try {
        // Intenta obtener la cookie 
        const userCookie = req.cookies.user;

        if (userCookie) {
            // Si la cookie existe, envía los datos como respuesta
            const { email, first_name, role } = userCookie;
            res.send({ email, first_name, role });
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
    const { role, first_name } = req.session;
    res.send(`Welcome ${first_name} to the administration panel, your role is ${role}!`);
});

router.get('/forgotPassword', (req, res) => {
    const error = req.query.error;
    res.render('fgPassword', { titlePage: 'Reset Password', error });
});

// Ruta para resetear contreseña
router.post('/forgotPassword', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.redirect('/forgotPassword?error=User not found');
        }

        // Hash the new password
        const hashedPassword = createHash(newPassword);

        user.password = hashedPassword;
        await user.save();

        res.redirect('/login?success=Password reset successful');
    } catch (error) {
        res.redirect('/forgotPassword?error=Failed to reset password');
    }
});

export default router;
