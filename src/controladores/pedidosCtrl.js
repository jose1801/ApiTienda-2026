import { conmysql } from '../db.js'; // 🌟 CORREGIDO: Importación con llaves {} para el export nombrado

export const guardarPedido = async (req, res) => {
    const conexion = await conmysql.getConnection();

    try {
        await conexion.beginTransaction();
        const {
            cli_id,
            cli_identificacion,
            cli_nombre,
            cli_telefono,
            cli_correo,
            cli_direccion,
            cli_pais,
            cli_ciudad,
            ped_fecha,
            usr_id,
            ped_estado,
            detalle
        } = req.body;

        // Validaciones
        if (!detalle || detalle.length === 0) {
            throw new Error("El pedido no tiene productos.");
        }
        let idCliente = Number(cli_id);

        // Cliente nuevo
        if (idCliente === 0) {
            const [cliente] = await conexion.query(
                `INSERT INTO clientes
                (
                    cli_identificacion,
                    cli_nombre,
                    cli_telefono,
                    cli_correo,
                    cli_direccion,
                    cli_pais,
                    cli_ciudad
                )
                VALUES (?,?,?,?,?,?,?)`,
                [
                    cli_identificacion,
                    cli_nombre,
                    cli_telefono,
                    cli_correo,
                    cli_direccion,
                    cli_pais,
                    cli_ciudad
                ]
            );

            idCliente = cliente.insertId;
        }

        // Pedido
        // 🚀 CORREGIDO: 4 columnas requerían exactamente 4 marcadores de posición (?)
        const [pedido] = await conexion.query(
            `INSERT INTO pedidos
            (
                cli_id,
                ped_fecha,
                usr_id,
                ped_estado
            )
            VALUES (?,?,?,?)`, // 🌟 Se agregó el "?" que faltaba aquí
            [
                idCliente,
                ped_fecha,
                usr_id,
                ped_estado
            ]
        );
        const ped_id = pedido.insertId;

        // Detalle
        for (const item of detalle) {
            if (Number(item.det_cantidad) <= 0) {
                throw new Error(`Cantidad inválida del producto ${item.prod_id}`);
            }
            if (Number(item.det_precio) <= 0) {
                throw new Error(`Precio inválido del producto ${item.prod_id}`);
            }

            // Verificar existencia del producto
            const [producto] = await conexion.query(
                "SELECT prod_id FROM productos WHERE prod_id=?",
                [item.prod_id]
            );
            if (producto.length === 0) {
                throw new Error(`El producto ${item.prod_id} no existe.`);
            }

            await conexion.query(
                `INSERT INTO pedidos_detalle
                (
                    prod_id,
                    ped_id,
                    det_cantidad,
                    det_precio
                )
                VALUES (?,?,?,?)`,
                [
                    item.prod_id,
                    ped_id,
                    item.det_cantidad,
                    item.det_precio
                ]
            );
        }

        await conexion.commit();
        res.status(201).json({
            ok: true,
            mensaje: "Pedido registrado correctamente.",
            ped_id,
            cli_id: idCliente
        });

    } catch (error) {
        await conexion.rollback();
        console.error(error);
        res.status(500).json({
            ok: false,
            mensaje: error.message
        });

    } finally {
        conexion.release();
    }
};

// 🚀 NUEVA FUNCIÓN AGREGADA: Para consultar el historial de pedidos de la tienda
export const obtenerPedidos = async (req, res) => {
    try {
        // Consultamos uniendo las tablas para sacar los nombres de clientes y productos
        const [rows] = await conmysql.query(`
            SELECT 
                p.ped_id,
                p.ped_fecha,
                p.ped_estado,
                c.cli_nombre,
                c.cli_identificacion,
                d.prod_id,
                pr.prod_nombre,
                d.det_cantidad,
                d.det_precio,
                (d.det_cantidad * d.det_precio) AS subtotal
            FROM pedidos p
            INNER JOIN clientes c ON p.cli_id = c.cli_id
            INNER JOIN pedidos_detalle d ON p.ped_id = d.ped_id
            INNER JOIN productos pr ON d.prod_id = pr.prod_id
            ORDER BY p.ped_id DESC
        `);

        // Agrupamos el resultado en un formato limpio (un pedido principal que contiene su arreglo de detalles)
        const pedidosAgrupados = rows.reduce((acumulador, fila) => {
            let pedido = acumulador.find(p => p.ped_id === fila.ped_id);
            if (!pedido) {
                pedido = {
                    ped_id: fila.ped_id,
                    ped_fecha: fila.ped_fecha,
                    ped_estado: fila.ped_estado,
                    cli_nombre: fila.cli_nombre,
                    cli_identificacion: fila.cli_identificacion,
                    total_pedido: 0,
                    detalle: []
                };
                acumulador.push(pedido);
            }
            pedido.detalle.push({
                prod_id: fila.prod_id,
                prod_nombre: fila.prod_nombre,
                det_cantidad: fila.det_cantidad,
                det_precio: fila.det_precio,
                subtotal: fila.subtotal
            });
            pedido.total_pedido += Number(fila.subtotal);
            return acumulador;
        }, []);

        res.status(200).json({
            ok: true,
            pedidos: pedidosAgrupados
        });

    } catch (error) {
        console.error("❌ Error en obtenerPedidos:", error);
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el historial de pedidos."
        });
    }
};