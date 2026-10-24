import { pool } from "../config/database";

export const listarPedidos = async () => {
    const resultado = await pool.query(`
        SELECT
            p.*,
            c.nombre AS cliente_nombre,
            COALESCE(SUM(pp.monto), 0) AS total_pagado,
            p.precio_acordado -
                COALESCE(SUM(pp.monto), 0) AS saldo_pendiente
        FROM pedidos p
        INNER JOIN clientes c ON c.id = p.cliente_id
        LEFT JOIN pagos_pedidos pp ON pp.pedido_id = p.id
        GROUP BY p.id, c.nombre
        ORDER BY p.id DESC
    `);

    return resultado.rows;
};
export const obtenerPedidoPorId = async (id: number) => {
    const resultado = await pool.query(
        `SELECT
            p.*,
            c.nombre AS cliente_nombre,
            COALESCE(SUM(pp.monto), 0) AS total_pagado,
            p.precio_acordado -
                COALESCE(SUM(pp.monto), 0) AS saldo_pendiente
         FROM pedidos p
         INNER JOIN clientes c ON c.id = p.cliente_id
         LEFT JOIN pagos_pedidos pp ON pp.pedido_id = p.id
         WHERE p.id = $1
         GROUP BY p.id, c.nombre`,
        [id]
    );

    return resultado.rows[0];
};
export const crearPedido = async (
    cliente_id: number,
    tipo: string,
    descripcion: string,
    medidas: string | null,
    precio_acordado: number,
    fecha_entrega: string | null
) => {
    const resultado = await pool.query(
        `INSERT INTO pedidos
        (cliente_id, tipo, descripcion, medidas,
         precio_acordado, fecha_entrega)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            cliente_id,
            tipo,
            descripcion,
            medidas,
            precio_acordado,
            fecha_entrega
        ]
    );

    return resultado.rows[0];
};