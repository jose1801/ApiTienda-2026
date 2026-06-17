import { conmysql as pool } from '../db.js';

export const getProductos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE prod_activo = 1');
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// 🌟 POST - Crear producto guardando solo la ruta relativa
export const crearProducto = async (req, res) => {
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, url_externa } = req.body;
    
    let imgFinal = '';
    if (req.file) {
        // En lugar de poner http://localhost, guardamos solo: uploads/nombre_archivo.png
        imgFinal = `uploads/${req.file.filename}`;
    } else if (url_externa) {
        imgFinal = url_externa;
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) VALUES (?, ?, ?, ?, ?, ?)',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo || 1, imgFinal]
        );
        res.status(201).json({ id: result.insertId, message: 'Producto guardado con éxito', url_imagen: imgFinal });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
};

// 🌟 PUT - Actualizar producto guardando solo la ruta relativa
export const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, url_externa } = req.body;
    
    try {
        const [existe] = await pool.query('SELECT prod_imagen FROM productos WHERE prod_id = ?', [id]);
        if (existe.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

        let imgFinal = existe[0].prod_imagen;
        if (req.file) {
            // Guardamos solo la ruta relativa al actualizar
            imgFinal = `uploads/${req.file.filename}`;
        } else if (url_externa) {
            imgFinal = url_externa;
        }

        await pool.query(
            'UPDATE productos SET prod_codigo = ?, prod_nombre = ?, prod_stock = ?, prod_precio = ?, prod_activo = ?, prod_imagen = ? WHERE prod_id = ?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, imgFinal, id]
        );
        res.json({ message: 'Producto actualizado con éxito', url_imagen: imgFinal });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
};

export const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE prod_id = ?', [id]);
        res.json({ message: 'Producto eliminado físicamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
};