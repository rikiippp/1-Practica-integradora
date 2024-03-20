import Router from 'express';
import ProductManager from '../dao/ProductManager.js';
import productsModel from '../dao/models/products.model.js';

const productManager = new ProductManager()

const router = Router();

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Obtengo todos los productos
router.get('/products', isAuthenticated, async (req, res) => {
    try {
        // console.log('User session:', req.session.user);
        // console.log('Is authenticated:', req.isAuthenticated());

        const { limit = 9, page = 1, sort, query } = req.query;
        const skip = (page - 1) * limit;
        let queryParams = {};

        if (query) {
            queryParams = { category: { $regex: query, $options: 'i' } };
        }

        const products = await productsModel.find(queryParams)
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sort ? { price: sort === 'asc' ? 1 : -1 } : {})
            .lean();

        const totalProducts = await productsModel.countDocuments(queryParams);
        const totalPages = Math.ceil(totalProducts / limit);

        // Asegura de que la página actual no exceda el número total de páginas
        if (page > totalPages) {
            return res.status(404).send('Page not found');
        }

        // Genera enlaces de paginación solo si hay páginas anteriores o siguientes disponibles
        const prevLink = page > 1 ? `/products?limit=${limit}&page=${parseInt(page) - 1}&query=${query || ''}` : null;
        const nextLink = page < totalPages ? `/products?limit=${limit}&page=${parseInt(page) + 1}&query=${query || ''}` : null;

        // Incrementa el contador de visitas cada vez que se accede a la página de inicio
        req.session.views = req.session.views ? ++req.session.views : 1;

        // Paso la informacion del user si esta autenticado
        const isLoggedIn = req.isAuthenticated();

        res.render('products', {
            favIcon: '/uploads/icon-clock.png',
            titlePage: 'Home | Products',
            payload: products,
            totalPages,
            prevLink,
            nextLink,
            page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            session: req.session,
            isLoggedIn: req.isAuthenticated()
        });
    } catch (error) {
        res.status(500).send('Error fetching products');
    }
});


// Obtengo productos por id
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ result: error.message });
    }
});

// Creo un nuevo producto
router.post('/products', async (req, res) => {
    try {
        const { title, description, image, price, stock, category } = req.body;

        // Verifico los campos ingresados
        if (!title || !description || !image || !category || typeof price !== 'number' || typeof stock !== 'number' || price <= 0 || stock <= 0) {
            res.status(400).json({ result: 'Incomplete or invalid required fields. Make sure you fill out everything correctly.' });
            return;
        }
        // Guardo los campos en una nueva variable
        const newProduct = { title, description, image, price, stock, category }
        await productManager.addProduct(newProduct);
        res.send({ result: 'Product added correctly', payload: newProduct });

    } catch (error) {
        res.status(500).json({ result: error.message });
    }
})

// Elimino un producto por id
router.delete('/products/:pid', async (req, res) => {
    try {
        const result = await productManager.deleteProduct(req.params.pid)
        res.send({ result: 'Product removed correctly', payload: result })
    } catch (error) {
        res.status(500).json({ result: 'Error when deleting the product' })
    }
})

// Modifico un producto ya creado
router.put('/products/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const updatedProduct = req.body;

        // Verifico si el producto existe antes de intentar actualizarlo
        const existingProduct = await productManager.getProductById(productId);
        if (!existingProduct) {
            return res.status(404).json({ result: 'Product not found' });
        }
        // Verifico si se proporcionaron todos los campos necesarios
        if (!updatedProduct.title || !updatedProduct.description || !updatedProduct.image || !updatedProduct.price || !updatedProduct.stock || !updatedProduct.category) {
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