import Router from "express";
import CartManager from "../dao/CartManager.js";
import cartModel from "../dao/models/carts.model.js";
import productsModel from "../dao/models/products.model.js";

// LOGIC
const cartManager = new CartManager();
// Función para calcular el total
function calculateTotal(price, quantity) {
    return price * quantity;
}


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

// Obtengo todos los carts
router.get('/api/carts', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts();
        res.send(carts);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching carts.' });
    }
});


// Obtengo el cart a través de su id
router.get('/api/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartModel.findById(cartId).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        // Mapear los productos del carrito para incluir el total
        const cartWithTotals = cart.products.map(product => ({
            ...product.toObject(), 
            total: product.productId.price * product.quantity
        }));
        res.render('cart', {
            favIcon: '/uploads/icon-clock.png',
            titlePage: 'Cart',
            cart: cartWithTotals
        });
    } catch (error) {
        res.status(500).json({ result: 'Cart not found.', error: error.message });
    }
});


// Agrego un producto a un cart especifico
router.post('/api/carts/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        let { quantity } = req.body;

        // Asignar un valor predeterminado a quantity si no se proporciona
        if (quantity === undefined || isNaN(quantity)) {
            quantity = 1; // Valor predeterminado 
        }

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

        // Reduce la cantidad del producto en  1
        cart.products[productIndex].quantity -= 1;

        // Si la cantidad del producto llega a  0, elimina el producto del carrito
        if (cart.products[productIndex].quantity <= 0) {
            cart.products.splice(productIndex, 1);
        }

        await cart.save();

        res.send({ result: 'Product quantity reduced successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Actualiza el carrito con un nuevo conjunto de productos
router.put('/api/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        if (!products) {
            return res.status(400).json({ message: 'No products provided.' });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        // Actualizar cada producto individualmente
        products.forEach((product) => {
            const productIndex = cart.products.findIndex(p => p.productId.toString() === product.productId.toString());
            if (productIndex !== -1) {
                // Si el producto ya existe en el carrito, actualizar su cantidad
                cart.products[productIndex].quantity = product.quantity;
            } else {
                // Si el producto no existe en el carrito, añadirlo
                cart.products.push({ productId: product.productId, quantity: product.quantity });
            }
        });

        await cart.save();

        res.send({ result: 'Cart updated successfully', payload: cart });
    } catch (error) {
        console.log(error);
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
        // Verificar si se proporcionó una cantidad
        if (quantity !== undefined) {
            const product = await productsModel.findById(pid); // Suponiendo que hay un modelo de productos llamado productModel
            if (!product) {
                return res.status(404).json({ message: 'Product not found.' });
            }

            // Verificar si la cantidad solicitada excede el stock disponible
            if (quantity > product.stock) {
                return res.status(400).json({ message: 'Requested quantity exceeds available stock.' });
            }

            // Actualizar la cantidad en el carrito solo si es menor o igual al stock disponible
            cart.products[productIndex].quantity = quantity;
            await cart.save();
            res.send({ result: 'Product quantity updated successfully', payload: cart });
        } else {
            return res.status(400).json({ message: 'Quantity not provided.' });
        }
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