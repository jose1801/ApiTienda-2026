import { Router } from 'express';
// 🌟 CORREGIDO: Cambiado '../controllers/' por '../controladores/'
import { guardarPedido } from '../controladores/pedidosCtrl.js'; 

const router = Router();

// Ruta para procesar la factura y el pedido
router.post('/pedidos', guardarPedido);

export default router;