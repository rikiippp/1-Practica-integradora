import productsModel from './models/products.model.js';

class ProductManager {
    async getProducts() {
        try {
            const products = await productsModel.find();
            return products;
        } catch (error) {
            throw error;
        }
    }

    async getProductById(productId) {
        try {
            const product = await productsModel.findOne({ _id: productId });
            return product;
        } catch (error) {
            throw error;
        }
    }

    async addProduct(newProduct) {
        try {
            const product = new productsModel(newProduct);
            await product.save();
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            await productsModel.findOneAndDelete({ _id: productId });
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(productId, updatedProduct) {
        try {
            await productsModel.findOneAndUpdate({ _id: productId }, updatedProduct, { new: true });
        } catch (error) {
            throw error;
        }
    }
}

export default ProductManager;
