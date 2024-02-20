import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import __dirname from './utils.js';
import mongoose from 'mongoose';


//LOGIC
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import chatRouter from './routes/chat.router.js';
import uploadRouter from './routes/upload.router.js';

const app = express();
const PORT = 8080;

//MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(path.join(__dirname, '/public')));

//HANDLEBARS
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

//ROUTER ENDOPOINTS
app.use('/', productsRouter)
app.use('/', cartsRouter)
app.use('/', chatRouter)
app.use('/', uploadRouter)

//ENDPOINTS
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})

//CONNECTION TO MONGODB ATLAS
mongoose.connect('mongodb+srv://rikiippp:deadboy212322@cluster0.cuvxaea.mongodb.net/ecommerce?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connection successful to MongoDb Atlas');
    })
    .catch((error) => {
        console.error('Error connecting:', error.message);
    });