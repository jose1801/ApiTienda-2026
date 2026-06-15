import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // ¡Importamos bcrypt!
import { JWT_SECRET } from '../config.js';
import { conmysql } from '../db.js'; // Importamos tu conexión a la base de datos

const router = Router();

// ==========================================
// RUTA 1: INICIO DE SESIÓN (LOGIN)
// ==========================================
router.post('/login', async (req, res) => {
    const { usr_usuario, usr_clave } = req.body;
    
    console.log("Intentando iniciar sesión con:", { usr_usuario, usr_clave });

    try {
        // Buscamos al usuario únicamente por su nombre de usuario
        const [result] = await conmysql.query(
            'SELECT * FROM usuarios WHERE usr_usuario = ?', 
            [usr_usuario]
        );

        // Si no encuentra el usuario, detenemos el proceso
        if (result.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result[0]; // Capturamos los datos del usuario encontrado

        // Comparamos la clave recibida en texto plano con la clave encriptada de la BD
        const esClaveCorrecta = await bcrypt.compare(usr_clave, user.usr_clave);

        if (esClaveCorrecta) {
            // Generamos el token guardando su usr_id y su nombre, expirando en 2 horas
            const token = jwt.sign(
                { id: user.usr_id, username: user.usr_usuario }, 
                JWT_SECRET, 
                { expiresIn: '2h' }
            );
            
            return res.json({ message: 'Autenticación exitosa', token });
        } else {
            // Si la contraseña no coincide
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

    } catch (error) {
        console.error("Error en el login:", error);
        return res.status(500).json({ message: 'Error interno del servidor al intentar hacer login' });
    }
});

// ==========================================
// RUTA 2: REGISTRO DE USUARIOS NUEVOS
// ==========================================
router.post('/registro', async (req, res) => {
    const { usr_usuario, usr_clave } = req.body;

    console.log("Intentando registrar al usuario:", usr_usuario);

    // Validación simple por si envían campos vacíos
    if (!usr_usuario || !usr_clave) {
        return res.status(400).json({ message: 'Por favor, proporcione usuario y contraseña' });
    }

    try {
        // 1. Verificar si el nombre de usuario ya existe para evitar duplicados
        const [usuarioExistente] = await conmysql.query(
            'SELECT * FROM usuarios WHERE usr_usuario = ?',
            [usr_usuario]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }

        // 2. Encriptar la contraseña del usuario (10 rondas de hashing)
        const saltRounds = 10;
        const claveEncriptada = await bcrypt.hash(usr_clave, saltRounds);

        // 3. Insertar el nuevo registro en la base de datos
        const [result] = await conmysql.query(
            'INSERT INTO usuarios (usr_usuario, usr_clave) VALUES (?, ?)', 
            [usr_usuario, claveEncriptada]
        );

        // Responder con éxito devolviendo el ID generado automáticamente
        return res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            usr_id: result.insertId 
        });

    } catch (error) {
        console.error("Error en el registro de usuario:", error);
        return res.status(500).json({ message: 'Error interno del servidor al intentar registrar' });
    }
});

export default router;