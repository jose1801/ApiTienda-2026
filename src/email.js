import nodemailer from 'nodemailer'; // 🌟 Módulos ES nativos

// CONFIGURACIÓN CON TUS CREDENCIALES
const transporador = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'js8754527@gmail.com',
    pass: 'ltpjtrwftdtpwszx'
  }
});

/**
 * Función para enviar el detalle de la compra al Administrador con Promesa
 */
export const enviarNotificacionCompra = (detallePedido, total) => {
  // 🌟 RETORNAMOS UNA PROMESA para que el controlador (async/await) pueda esperar la respuesta de Google
  return new Promise((resolve, reject) => {
    let filasProductos = '';
    
    // Recorremos el vector anidado asegurando compatibilidad con la estructura de tu carrito
    detallePedido.forEach(item => {
      // Filtro de seguridad: Lee desde item.producto (si existe) o directamente desde item
      const nombre = item.producto?.prod_nombre || item.prod_nombre || 'Producto';
      const precio = item.producto?.prod_precio || item.prod_precio || 0;
      const cantidad = item.cantidad || 0;
      const subtotal = item.subtotal || (precio * cantidad);

      filasProductos += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${nombre}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${cantidad}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(precio).toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(subtotal).toFixed(2)}</td>
        </tr>
      `;
    });

    const opcionesCorreo = {
      from: '"Sistema Inteligente de Gestión" <js8754527@gmail.com>',
      to: 'js8754527@gmail.com',
      subject: '🚨 ¡Nueva Compra Recibida en el Sistema!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff; color: #333333;">
          <h2 style="color: #2dd36f; text-align: center; margin-bottom: 20px;">🛒 ¡Nueva Orden de Compra!</h2>
          <p>Hola Administrador, se ha registrado un nuevo pedido desde la aplicación móvil utilizando vectores anidados. A continuación el detalle de los artículos:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Producto</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Cant.</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">P. Unit</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${filasProductos}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; text-align: right; border-radius: 5px; border-left: 4px solid #2dd36f;">
            <h3 style="margin: 0; color: #111;">Total General a Cobrar: <span style="color: #2dd36f; font-size: 1.4rem;">$${Number(total).toFixed(2)}</span></h3>
          </div>
          
          <p style="font-size: 0.8rem; color: #888; margin-top: 30px; text-align: center;">Sistema Inteligente de Gestión y Ventas • UPSE 2026</p>
        </div>
      `
    };

    // Enviamos el correo electrónico
    transporador.sendMail(opcionesCorreo, (error, info) => {
      if (error) {
        console.error('❌ Error real devuelto por Google:', error);
        reject(error); // Rompe la promesa si falla la contraseña o los servidores
      } else {
        console.log('📧 Correo enviado con éxito e identificado por Google:', info.response);
        resolve(info); // Completa la promesa correctamente
      }
    });
  });
};