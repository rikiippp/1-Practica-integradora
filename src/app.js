import express from 'express';
import mongoose from 'mongoose';

//LOGIC
import ProductManager from './dao/ProductManager.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const PORT = 8080;
const productManager = new ProductManager();

//MIDDLEWARES
app.use(express.json())

//ROUTER ENDOPOINTS
app.use('/', productsRouter)
app.use('/', cartsRouter)

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