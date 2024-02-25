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

    async addProductToCart(cartId, productId, quantity) {
        try {
            const cart = await cartModel.findById(cartId);
            if (!cart) {
                throw new Error('Cart not found.');
            }

            const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId.toString());

            if (existingProductIndex !== -1) {
                // Si el producto ya existe en el carrito, actualiza su cantidad
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                // Si el producto no existe en el carrito, lo agrega con la cantidad especificada
                cart.products.push({ productId, quantity });
            }

            await cart.save();
            return cart;
        } catch (error) {
            throw error;
        }
    }
};

export default CartManager;
