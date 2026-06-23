import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

export const verifyToken = (req, res, next) => {
    // 🌟 EXCEPCIÓN CORREGIDA: Detecta si la URL contiene la búsqueda del cliente, ignorando el prefijo
    if (req.originalUrl.includes('/ventas/cliente/')) {
        return next();
    }

    // Obtener el token desde los headers (usualmente en 'Authorization')
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No se proporcionó un token de seguridad' });
    }

    try {
        // El formato estándar es "Bearer <token>", por lo que extraemos solo el token
        const token = authHeader.split(' ')[1];
        
        // Verificamos el token usando nuestra clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Guardamos los datos decodificados en el request para que puedan ser usados por los controladores
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido o expirado' });
    }
};

// 🌟 Mantenemos este alias por si acaso algún otro archivo de rutas lo importa con este nombre
export const verificarToken = verifyToken;