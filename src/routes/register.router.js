import Router from 'express';
import User from '../dao/models/user.model.js';
import { createHash } from '../utils.js';
import passport from 'passport';

const router = Router();

router.get('/', (req, res) => {
    const error = req.query.error;
    res.render('register', {
        titlePage: 'Register | Relojeria',
        error
    });
});

// Ruta para el registro de usuarios
router.post('/', passport.authenticate('register', {
    successRedirect: '/login',
    failureRedirect: '/?error=Registration failed'
}), async (req, res) => {

});

export default router;
