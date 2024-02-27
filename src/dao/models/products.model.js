import mongoose from 'mongoose';

const productsCollection = 'products'

const productSchema = new mongoose.Schema({
    title: { type: String, require: true, max: 100 },
    description: { type: String, require: true, max: 150},
    image: { type: String, require: true},
    price: { type: Number, require: true },
    stock: {type: Number, require: true },
    category: {type: String, require: true, max: 100}
});

const productsModel = mongoose.model(productsCollection, productSchema);

export default productsModel;