import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtén el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {
    constructor(filePath, io) {
        this.path = filePath;
        this.products = [];
        this.loadProducts();
        this.io = io;
    }

    async loadProducts() {
        try {
            // Construye la ruta al archivo 'products.json' dentro de la carpeta 'models'
            const filePath = path.join(__dirname, '../data/products.json');
            const data = await fs.readFile(filePath, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            console.error('Error al cargar productos desde el archivo:', error.message);
            throw error;
        }
    }

    async getProducts() {
        try {
            await this.loadProducts();
            return this.products;
        } catch (error) {
            throw error;
        }
    }

    async getProductById(productId) {
        try {
            await this.loadProducts();
            const product = this.products.find(p => p.id === parseInt(productId, 10));
            if (!product) {
                // console.log(`\nNo se encontró un producto con ID ${productId}`);
                return null;
            }
            // console.log(`\n¡Producto encontrado con ID ${productId}!`);
            // console.log(product);
            return product;
        } catch (error) {
            throw error;
        }
    }

    async addProduct(newProduct) {
        try {
            this.products.push(newProduct);
            await this.saveProducts();
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            await this.loadProducts();

            // Filtro los productos, excluyendo aquellos con el ID a eliminar
            const updatedProducts = this.products.filter(p => p.id !== parseInt(productId, 10));

            // Verifica si algún producto fue eliminado
            if (updatedProducts.length < this.products.length) {
                this.products = updatedProducts;

                await this.saveProducts();

                // Emitir actualización después de la eliminación
                if (this.io) {
                    this.io.emit('update-products', await this.getProducts());
                }
            } else {
                console.log(`\nNo se encontró un producto con ID ${productId}`);
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error.message);
        }
    }

    async updateProduct(productId, updatedProduct) {
        try {
            // Lee los productos desde el archivo antes de actualizar
            await this.loadProducts();

            const index = this.products.findIndex(p => p.id === productId);

            if (index !== -1) {
                // Actualizo el producto
                this.products[index] = { ...this.products[index], ...updatedProduct };

                // Guardo los productos
                await this.saveProducts();
                // console.log(`\n¡Producto actualizado con ID ${productId}!`);
                // console.log(this.products[index]);
                return { success: true, product: this.products[index] };
            } else {
                // Devuelve un objeto indicando el fallo y un mensaje de error
                return { success: false, error: `No se encontró un producto con ID ${productId}` };
            }
        } catch (error) {
            // console.error('Error al actualizar el producto:', error.message);
            return { success: false, error: 'Error al actualizar el producto' };
        }
    }

    async saveProducts() {
        try {
            const dataToWrite = JSON.stringify(this.products, null, 2);
            await fs.writeFile(this.path, dataToWrite, 'utf8');
        } catch (error) {
            console.error('Error al guardar productos en el archivo:', error.message);
            throw error;
        }
    }
}

export default ProductManager;

