import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import handlebars from 'express-handlebars';
import path from 'path';
import { __dirname } from './utils.js';
import passport from 'passport';

//LOGIC
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import chatRouter from './routes/chat.router.js';
import uploadRouter from './routes/upload.router.js';
import registerRouter from './routes/register.router.js';
import loginRouter from './routes/login.router.js';
import initializePassport from './dao/config/localAuth.config.js';

const app = express();
const PORT = 8080;

//MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '/public')));

//SESSIONS
app.use(session({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://rikiippp:deadboy212322@cluster0.cuvxaea.mongodb.net/ecommerce?retryWrites=true&w=majority'
    }),
    cookie: { httpOnly: false, secure: false, maxAge: 120000 } // 2 minuto
}));

//PASSPORT
initializePassport()
app.use(passport.initialize());
app.use(passport.session());

//COOKIE
app.use(cookieParser());

//HANDLEBARS
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

//ROUTER ENDOPOINTS
app.use('/', productsRouter);
app.use('/', cartsRouter);
app.use('/', chatRouter);
app.use('/', uploadRouter);
app.use('/', registerRouter)
app.use('/', loginRouter);

//ENDPOINTS

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
});

//CONNECTION TO MONGODB ATLAS
mongoose.connect('mongodb+srv://rikiippp:deadboy212322@cluster0.cuvxaea.mongodb.net/ecommerce?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connection successful to MongoDb Atlas');
    })
    .catch((error) => {
        console.error('Error connecting:', error.message);
    });
