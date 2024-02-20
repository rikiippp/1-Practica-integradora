import fs from 'fs/promises';

class CartManager {
    constructor(filePath) {
        this.path = filePath;
    }

    async createCart() {
        try {
            const cartsData = await fs.readFile(this.path, 'utf-8');
            const carts = JSON.parse(cartsData);

            const generateCartID = Date.now().toString(30);

            const newCart = {
                id: generateCartID,
                products: []
            };

            carts.push(newCart);

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));

            return newCart;
        } catch (error) {
            throw error;
        }
    }

    async getCart(cartId) {
        try {
            const cartsData = await fs.readFile(this.path, 'utf-8');
            const carts = JSON.parse(cartsData);

            const cart = carts.find(c => c.id === cartId);

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            return cart.products;
        } catch (error) {
            throw error;
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const cartsData = await fs.readFile(this.path, 'utf-8');
            const carts = JSON.parse(cartsData);

            const cart = carts.find(c => c.id === cartId);

            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const existingProduct = cart.products.find(p => p.productId === productId);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({
                    productId: productId,
                    quantity: 1
                });
            }

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));

            return cart;
        } catch (error) {
            throw error;
        }
    }
}

export default CartManager;
