import Router from "express";
import CartManager from "../dao/CartManager.js";
import cartModel from "../dao/models/carts.model.js";

const cartManager = new CartManager();

const router = Router();

//ENDPOINTS
// Creo un nuevo cart
router.post('/api/carts', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({ message: 'Cart successfully created.', newCart });
    } catch (error) {
        res.status(500).json({ result: 'Error creating your cart.', error: error.message });
    }
});

// Obtengo el cart atraves de su id
router.get('/api/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cartProducts = await cartManager.getCart(cartId);
        res.send({ cart: cartProducts});
    } catch (error) {
        res.status(500).json({ result: 'Cart not found.', error: error.message });
    }
});

// Agrego un producto a un cart especifico
router.post('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body; // Asegugarse de la cantidad

        const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);

        res.send({ result: 'Success', payload: updatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Eliminar un producto del carrito
router.delete('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

        cart.products.splice(productIndex, 1);
        await cart.save();

        res.send({ result: 'Product removed from cart successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Actualizar el carrito con un nuevo conjunto de productos
router.put('/api/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        cart.products = products.map(p => ({ productId: p.productId, quantity: p.quantity }));
        await cart.save();

        res.send({ result: 'Cart updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();

        res.send({ result: 'Product quantity updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Eliminar todos los productos del carrito
router.delete('/api/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        cart.products = [];
        await cart.save();

        res.send({ result: 'All products removed from cart successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
});


export default router;
