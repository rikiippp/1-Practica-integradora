import Router from 'express';
import User from '../dao/models/user.model.js';
import { createHash, isValidPassword } from '../utils.js';
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
    successRedirect: '/products',
    failureRedirect: '/login?error=Login failed'
}), async (req, res) => { 

});

// Rutas de autenticación
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { });

// Ruta del callback
router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Redirecciona a la página principal después de iniciar sesión con éxito
        res.redirect('/products');
    });

// Ruta para obtener la cookie
router.get('/getCookie', (req, res) => {
    try {
        // Intenta obtener la cookie 
        const userCookie = req.cookies.user;

        if (userCookie) {
            // Si la cookie existe, envia los datos como respuesta
            const { email, name, role } = userCookie;
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
