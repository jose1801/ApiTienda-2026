import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js'; 
import authRoutes from './routes/auth.routes.js';
import { verifyToken } from './jwt.middleware.js';

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

// Ruta pública para hacer login
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api', verifyToken, clientesRoutes);
app.use('/api', verifyToken, productosRoutes); 
app.use('/api/ventas', require('./routes/ventas.routes'));

app.use((req,res,next)=>{
    res.status(400).json({
        message:"endpoint no encontrado"
    })
})

export default app;