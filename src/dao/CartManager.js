import cartModel from './models/carts.model.js';

class CartManager {
    async createCart() {
        try {
            const newCart = new cartModel({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            throw error;
        }
    };

    async getCart(cartId) {
        try {
            const cart = await cartModel.findById(cartId).populate('products.productId');
            if (!cart) {
                throw new Error('Cart not found.');
            }
            return cart.products;
        } catch (error) {
            throw error;
        }
    };

    async getAllCarts() {
        try {
            const carts = await cartModel.find().populate('products.productId');
            return carts;
        } catch (error) {
            throw error;
        }
    };

    async addProductToCart(cartId, productId, quantity) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found.');
            }

            const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId.toString());

            // Asegurarse de que quantity sea un número
            const quantityNumber = parseInt(quantity, 10);
            if (isNaN(quantityNumber)) {
                quantityNumber = 1; // Valor predeterminado si quantity no es un número
            }

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantityNumber;
            } else {
                cart.products.push({ productId, quantity: quantityNumber });
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw error;
        }
    }
};

export default CartManager;
