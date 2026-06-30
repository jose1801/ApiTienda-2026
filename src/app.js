import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js'; 
import authRoutes from './routes/auth.routes.js';
import { verifyToken } from './jwt.middleware.js';
import rutaVentas from './routes/ventas.routes.js'; // 🌟 Usamos import en lugar de require
import pedidosRoutes from './routes/pedidos.routes.js'; // AGREGA ESTA LÍNEA

const app = express();

// Configuración para obtener rutas absolutas en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la carpeta 'uploads' automáticamente si no existe en la raíz de src
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const corsOptions = {
    origin: '*', 
    methods: ['GET','POST','PUT','PATCH','DELETE'], 
    credentials: true    
}

app.use(cors(corsOptions));
app.use(express.json());

// 🌟 HACER LA CARPETA UPLOADS PÚBLICA (Abajo de tus configuraciones)
app.use('/uploads', express.static(uploadDir));

// =============== RUTAS ===============

// 1️⃣ RUTAS PÚBLICAS (Van arriba, sin candado de seguridad)
app.use('/api/auth', authRoutes);
app.use('/api/ventas', rutaVentas); // 🌟 MOVIDO AQUÍ: Ahora es pública y no le afectará el verifyToken
app.use('/api', pedidosRoutes); // AGREGA ESTA LÍNEA (Tu endpoint quedará como: /api/pedidos)
// 2️⃣ RUTAS PROTEGIDAS (Llevan el filtro de verificación)
app.use('/api', verifyToken, clientesRoutes);
app.use('/api', verifyToken, productosRoutes);

app.use((req,res,next)=>{
    res.status(400).json({
        message:"endpoint no encontrado"
    })
})

export default app;