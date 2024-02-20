import Router from 'express';
import upload from '../dao/MulterController.js';

const router = Router();

//Cargo archivos para los estilos
router.post('/api/upload', upload.any(), (req, res) => {
    res.send('File uploaded successfully');
});

export default router;