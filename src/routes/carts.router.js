import Router from "express";
import CartManager from "../dao/CartManager.js";

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

router.post('/api/carts/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const updatedCart = await cartManager.addProductToCart(cartId, productId);

        res.send({ result: 'Success', payload: updatedCart} )
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error.' });
    }
});

export default router;
