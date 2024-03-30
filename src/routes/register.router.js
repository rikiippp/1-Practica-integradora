import Router from 'express';
import passport from 'passport';

const router = Router();

// Middleware para manejar errores de Passport
const handlePassportError = (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/?error=' + info.message);
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/login');
        });
    })(req, res, next);
};

router.get('/', (req, res) => {
    const error = req.query.error;
    res.render('register', {
        titlePage: 'Register | Relojeria',
        error
    });
});

// Ruta para el registro de usuarios
router.post('/', handlePassportError);

export default router;
