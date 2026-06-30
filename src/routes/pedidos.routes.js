import { Router } from 'express';
// 🌟 Agregamos 'obtenerPedidos' a la importación del controlador
import { guardarPedido, obtenerPedidos } from '../controladores/pedidosCtrl.js'; 

const router = Router();

// 🚀 NUEVA RUTA: Para listar los pedidos con sus detalles
router.get('/pedidos', obtenerPedidos);

// Ruta para procesar la factura y el pedido
router.post('/pedidos', guardarPedido);

export default router;