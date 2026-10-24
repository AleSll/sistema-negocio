import { pool } from "../config/database";

export const registrarPago = async (
    pedido_id: number,
    monto: number,
    metodo_pago: string | null,
    observacion: string | null
) => {
    const resultado = await pool.query(
        `INSERT INTO pagos_pedidos
        (pedido_id, monto, metodo_pago, observacion)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [pedido_id, monto, metodo_pago, observacion]
    );

    return resultado.rows[0];
};

export const obtenerPagosPorPedido = async (
    pedido_id: number
) => {
    const resultado = await pool.query(
        `SELECT *
         FROM pagos_pedidos
         WHERE pedido_id = $1
         ORDER BY fecha_pago DESC`,
        [pedido_id]
    );

    return resultado.rows;
};