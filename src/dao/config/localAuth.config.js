import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import bcrypt from 'bcrypt'
import User from '../models/user.model.js';
import { createHash, isValidPassword } from '../../utils.js';

//LOGIC
const LocalStrategy = local.Strategy;

const initializePassport = () => {

    passport.use('register', new LocalStrategy(
        { passReqToCallback: true, usernameField: "email" }, async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body;

            try {
                let user = await User.findOne({ email: username });
                if (user) {
                    return done(null, false, { message: 'Email already in use.' });
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                };
                let result = await User.create(newUser);
                return done(null, result);
            } catch (error) {
                return done(null, false, { message: 'An error occurred during registration.' });
            }
        }
    ));

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            const user = await User.findOne({ email: username });
            if (!user) {
                return done(null, false, { message: 'User does not exist' });
            }
            if (!isValidPassword(user, password)) {
                return done(null, false, { message: 'Incorrect email or password' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.use(new GitHubStrategy({
        clientID: 'Iv1.9f4a4fbd1290f31a',
        clientSecret: 'f7e4cb3fae3555fb3fac82e323e683b72b183283',
        callbackURL: 'http://localhost:8080/auth/github/callback'
    }, async function (accessToken, refreshToken, profile, done) {
        try {
            // console.log('GitHub profile:', profile); 

            // Busca al usuario en la base de datos por su email
            let user = await User.findOne({ email: profile._json.email });

            if (!user) {
                // Si el usuario no existe, crear una nueva cuenta con contraseña
                const password = await bcrypt.hash(profile.id, 10);
                user = new User({
                    first_name: profile._json.name,
                    last_name: profile._json.last_name || 'N/A', // Si no tienen valor se les agrega uno default  
                    email: profile._json.email,
                    age: profile._json.age || 0,  // Si no tienen valor se les agrega uno default
                    password: password,
                    role: 'user',
                });
                await user.save();
            }
            // console.log('User authenticated with GitHub:', user); 

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

}

export default initializePassport;