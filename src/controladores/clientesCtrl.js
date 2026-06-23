import { conmysql } from '../db.js'

export const getClientes = async (req, res) => {
    try {
        const [result] = await conmysql.query('select * from clientes')
        res.json(result)
    } catch (error) {
        console.error("Error real de MySQL:", error); // <-- Agrega esta línea
        return res.status(500).json({ message: 'Error al obtener los clientes' })
    }
}


export const getclientesxid=async (req, res)=>{
    try {
         const [result] = await conmysql.query('select * from clientes where cli_id =?', [req.params.id]);
        if (result.length <= 0) return res.json(
            {
            cantidad: 0,
            message: 'No se encontro el cliente'
            }
        )
        res.json({cantidad: result.length,data: result[0],
        }
    )
    }catch (error) {
        return res.status(500).json({ message: 'Error al obtener el cliente' })
    }
}
export const postInsertarClientes = async (req, res) => {
    try {
        const{cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad}=req.body;
        // console.log(req.body);
        const [result] = await conmysql.query(
            'insert into clientes (cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad) values (?,?,?,?,?,?,?)',
            [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad]
        );
        res.send({  cli_id:result.insertId});
    } catch (error) {
        return res.status(500).json({ message: 'Error al insertar el cliente' });
    }
}

export const putClientes = async (req, res) => {
    try {
        const { id } = req.params
        const{cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad}=req.body;
        // console.log(req.body);
        const [result] = await conmysql.query(
            'update clientes set cli_identificacion = ?, cli_nombre = ?, cli_telefono = ?, cli_correo = ?, cli_direccion = ?, cli_pais = ?, cli_ciudad = ? where cli_id = ?',
            [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad, id]
        );
        res.send({ cli_id: id,
            message: 'Cliente actualizado exitosamente'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el cliente' });
    }
}

export const patchClientes = async (req, res) => {
    try {
        const { id } = req.params;
        const { cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad } = req.body;
        
        // Utilizamos IFNULL para conservar el valor actual en la BD si el campo no se envía en la petición
        const [result] = await conmysql.query(
            'update clientes set cli_identificacion = IFNULL(?, cli_identificacion), cli_nombre = IFNULL(?, cli_nombre), cli_telefono = IFNULL(?, cli_telefono), cli_correo = IFNULL(?, cli_correo), cli_direccion = IFNULL(?, cli_direccion), cli_pais = IFNULL(?, cli_pais), cli_ciudad = IFNULL(?, cli_ciudad) where cli_id = ?',
            [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' });

        res.send({ cli_id: id,
            message: 'Cliente actualizado parcialmente'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar parcialmente el cliente' });
    }
}

export const deleteClientes = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await conmysql.query('delete from clientes where cli_id = ?', [id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' });

        return res.status(200).json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
}
// En tu controlador de Node.js (ej: clientesCtrl.js)
export const buscarClientePorCedula = async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Consulta SQL a tu tabla 'cliente' de base2026
    const [rows] = await db.query('SELECT * FROM cliente WHERE cli_cedula = ?', [cedula]);

    if (rows.length > 0) {
      // Si existe, retornamos el primer registro encontrado
      return res.json({ encontrado: true, cliente: rows[0] });
    } else {
      // Si no existe, avisamos para que el frontend abra el formulario
      return res.json({ encontrado: false });
    }
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    return res.status(500).json({ encontrado: false, error: 'Error del servidor' });
  }
};