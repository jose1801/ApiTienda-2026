import { pool } from '../db.js'; // Tu conexión configurada a Aiven

// 1. GET - Obtener todos los productos activos
export const getProductos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos WHERE prod_activo = 1');
        res.json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// 2. POST - Insertar un nuevo producto
export const crearProducto = async (req, res) => {
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen) VALUES (?, ?, ?, ?, ?, ?)',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo || 1, prod_imagen || '']
        );
        res.status(201).json({ id: result.insertId, message: 'Producto guardado con éxito' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
};

// 3. PUT - Actualizar un producto existente
export const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen } = req.body;
    try {
        await pool.query(
            'UPDATE productos SET prod_codigo = ?, prod_nombre = ?, prod_stock = ?, prod_precio = ?, prod_activo = ?, prod_imagen = ? WHERE prod_id = ?',
            [prod_codigo, prod_nombre, prod_stock, prod_precio, prod_activo, prod_imagen, id]
        );
        res.json({ message: 'Producto actualizado con éxito' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
};

// 4. DELETE - Eliminar un producto físicamente (o puedes hacer un borrado lógico)
export const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE prod_id = ?', [id]);
        res.json({ message: 'Producto eliminado físicamente del inventario' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
};