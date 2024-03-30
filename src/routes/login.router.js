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

// Middleware para manejar errores de Passport en el login
const handleLoginError = (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect(`/login?error=${info.message}`);
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Establezco la session
            req.session.user = user;
            // Establezco la cookie 
            res.cookie('user', { email: user.email, first_name: user.first_name, role: user.role });
            res.redirect('/products'); // Redirecciona al main si esta todo correcto
        });
    })(req, res, next);
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
router.post('/login', handleLoginError);

// Rutas de autenticación
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { });

// Ruta del callback
router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    async (req, res) => {
        // Extraigo la información necesaria del objeto req.user
        const { displayName: username, first_name, email, role } = req.user;

        // Guarda el objeto de usuario completo en la sesión, incluyendo el ID
        req.session.user = req.user;
        
        console.log('session', req.session.user)
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

// Ruta para acceder a la info del user
router.get('/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        User.findById(req.session.user._id)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                // Aquí puedes especificar explícitamente qué campos incluir en la respuesta
                res.json({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    age: user.age,
                    role: user.role
                });
            })
            .catch(error => {
                console.log(error)
                res.status(500).json({ error: 'An error occurred while fetching the user' });
            });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

export default router;
