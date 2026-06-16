import express from 'express';
//npm install cors
import cors from 'cors';
import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js'; // 🌟 Importación de rutas de productos
import authRoutes from './routes/auth.routes.js';
import { verifyToken } from './jwt.middleware.js';

const app = express();

const corsOptions = {
    origin: '*', // Reemplaza con la URL de tu frontend
    methods: ['GET','POST','PUT','PATCH','DELETE'], // Métodos HTTP permitidos
    credentials: true // Permitir el envío de cookies y credenciales    
}

app.use(cors(corsOptions));
app.use(express.json());//para que interprete los objetos json

//rutas

// Ruta pública para hacer login y obtener el token
app.use('/api/auth', authRoutes);

// Rutas protegidas: Se incluye productosRoutes junto a clientes bajo la seguridad del Token 🌟
app.use('/api', verifyToken, clientesRoutes);
app.use('/api', verifyToken, productosRoutes); 

app.use((req,res,next)=>{
    res.status(400).json({
        message:"endpoint no encontrado"
    })
})

export default app;