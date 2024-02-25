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

    async addProductToCart(cartId, productId) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found.');
            }

            const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId.toString());

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += 1;
            } else {
                cart.products.push({ productId, quantity: 1 });
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw error;
        }
    };
};

export default CartManager;
