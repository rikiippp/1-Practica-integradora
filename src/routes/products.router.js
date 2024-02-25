import Router from 'express';
import ProductManager from '../dao/ProductManager.js';

const productManager = new ProductManager()

const router = Router();

// Obtengo todos los productos
router.get('/api/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const skip = (page - 1) * limit;
        let queryParams = {};

        if (query) {
            queryParams = {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } }
                ]
            };
        }

        const products = await productsModel.find(queryParams)
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sort ? { price: sort === 'asc' ? 1 : -1 } : {});

        const totalProducts = await productsModel.countDocuments(queryParams);
        const totalPages = Math.ceil(totalProducts / limit);

        res.send({
            status: 'success',
            payload: products,
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}` : null,
            nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}` : null
        });
    } catch (error) {
        res.status(500).json({ result: 'Error when obtaining the products', error });
    }
});

// Obtengo productos por id
router.get('/api/products/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ result: error.message });
    }
})

// Creo un nuevo producto
router.post('/api/products', async (req, res) => {
    try {
        const { title, description, price, stock, category } = req.body;

        // Verifico los campos ingresados
        if (!title || !description || !category || typeof price !== 'number' || typeof stock !== 'number' || price <= 0 || stock <= 0) {
            res.status(400).json({ result: 'Incomplete or invalid required fields. Make sure you fill out everything correctly.' });
            return;
        }
        // Guardo los campos en una nueva variable
        const newProduct = { title, description, price, stock, category }
        await productManager.addProduct(newProduct);
        res.send({ result: 'Product added correctly', payload: newProduct });

    } catch (error) {
        res.status(500).json({ result: error.message });
    }
})

// Elimino un producto por id
router.delete('/api/products/:pid', async (req, res) => {
    try {
        const result = await productManager.deleteProduct(req.params.pid)
        res.send({ result: 'Product removed correctly', payload: result })
    } catch (error) {
        res.status(500).json({ result: 'Error when deleting the product' })
    }
})

// Modifico un producto ya creado
router.put('/api/products/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const updatedProduct = req.body;

        // Verifico si el producto existe antes de intentar actualizarlo
        const existingProduct = await productManager.getProductById(productId);
        if (!existingProduct) {
            return res.status(404).json({ result: 'Product not found' });
        }
        // Verifico si se proporcionaron todos los campos necesarios
        if (!updatedProduct.title || !updatedProduct.description || !updatedProduct.price || !updatedProduct.stock || !updatedProduct.category) {
            return res.status(400).json({ error: 'Missing data to be completed' });
        }

        // Actualizo el producto
        await productManager.updateProduct(productId, updatedProduct);

        res.json({ result: 'Product successfully upgraded' });
    } catch (error) {
        res.status(500).json({ result: 'Error updating the product', error: error.message });
    }
});

export default router;