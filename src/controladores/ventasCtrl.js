import { enviarNotificacionCompra } from '../email.js';

export const procesarNuevaVenta = async (req, res) => {
  try {
    const { carrito, total } = req.body;

    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ OK: false, mensaje: 'El carrito está vacío' });
    }

    console.log('📦 Procesando pedido recibido en el servidor...');

    // 🌟 CAMBIO CLAVE: Esperamos a que Nodemailer intente realizar la conexión antes de responderle al celular
    try {
      await enviarNotificacionCompra(carrito, total); 
      console.log('🔄 Proceso de envío finalizado.');
    } catch (mailError) {
      console.error('❌ Error directo en la llamada de correo:', mailError);
    }

    // Solo respondemos cuando la tarea asíncrona se haya completado
    return res.json({
      OK: true,
      mensaje: '¡Pedido recibido! Notificación de correo enviada al administrador.'
    });

  } catch (error) {
    console.error('❌ Error crítico en ventasCtrl:', error);
    return res.status(500).json({ OK: false, mensaje: 'Error interno en el servidor.' });
  }
};