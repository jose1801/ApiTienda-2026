// 🌟 CORRECCIÓN ES MODULES: Usamos import con la extensión .js explícita
import { enviarNotificacionCompra } from '../email.js';

export const procesarNuevaVenta = async (req, res) => {
  try {
    // El req.body recibe el vector anidado del carrito y el total desde el celular
    const { carrito, total } = req.body;

    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ OK: false, mensaje: 'El carrito está vacío' });
    }

    // 📧 Disparamos la alerta de correo electrónico con tus credenciales
    enviarNotificacionCompra(carrito, total);

    // Respondemos a la aplicación móvil que todo salió perfecto
    res.json({
      OK: true,
      mensaje: '¡Pedido recibido! Notificación de correo enviada al administrador.'
    });

  } catch (error) {
    console.error('Error en ventasCtrl:', error);
    res.status(500).json({ OK: false, mensaje: 'Error interno en el servidor al procesar la venta' });
  }
};