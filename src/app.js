import express from 'express';
//npm install cors
import cors from 'cors';
import clientesRoutes from './routes/clientes.routes.js';
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

// Ruta protegida: Se debe enviar el token en el header Authorization
app.use('/api', verifyToken, clientesRoutes);

app.use((req,res,next)=>{
    res.status(400).json({
        message:"endpoint no encontrado"
    })
})
export default app;