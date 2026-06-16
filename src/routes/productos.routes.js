import { Router } from 'express';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from '../controladores/productosCtrl.js';

const router = Router();

// Definición de Endpoints
router.get('/productos', getProductos);
router.post('/productos', crearProducto);
router.put('/productos/:id', actualizarProducto);
router.delete('/productos/:id', eliminarProducto);

export default router;