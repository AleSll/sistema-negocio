import { pool } from "../config/database";

// Registrar un pago de alquiler
export const registrarPagoAlquiler = async (
    alquiler_id: number,
    monto: number,
    tipo_pago: string,
    metodo_pago: string | null,
    observacion: string | null
) => {
    const resultado = await pool.query(
        `INSERT INTO pagos_alquileres (
            alquiler_id,
            monto,
            tipo_pago,
            metodo_pago,
            observacion
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
            alquiler_id,
            monto,
            tipo_pago,
            metodo_pago,
            observacion
        ]
    );

    return resultado.rows[0];
};

// Consultar los pagos de un alquiler
export const listarPagosAlquiler = async (
    alquiler_id: number
) => {
    const resultado = await pool.query(
        `SELECT *
         FROM pagos_alquileres
         WHERE alquiler_id = $1
         ORDER BY fecha_pago DESC`,
        [alquiler_id]
    );

    return resultado.rows;
};
// Obtener resumen financiero de un alquiler
export const obtenerResumenAlquiler = async (
    alquiler_id: number
) => {
    const resultado = await pool.query(
        `SELECT
            a.id AS alquiler_id,
            a.precio_alquiler,
            a.deposito_garantia,

            COALESCE(
                SUM(p.monto) FILTER (
                    WHERE p.tipo_pago = 'alquiler'
                ), 0
            ) AS total_pagado,

            COALESCE(
                SUM(p.monto) FILTER (
                    WHERE p.tipo_pago = 'alquiler'
                ), 0
            ) AS total_abonado_alquiler,

            COALESCE(
                SUM(p.monto) FILTER (
                    WHERE p.tipo_pago = 'deposito'
                ), 0
            ) -
            COALESCE(
                SUM(p.monto) FILTER (
                    WHERE p.tipo_pago = 'devolucion_deposito'
                ), 0
            ) AS deposito_actual

        FROM alquileres a
        LEFT JOIN pagos_alquileres p
            ON p.alquiler_id = a.id
        WHERE a.id = $1
        GROUP BY a.id`,
        [alquiler_id]
    );

    if (resultado.rowCount === 0) {
        return null;
    }

    const datos = resultado.rows[0];

    const precio = Number(datos.precio_alquiler);
    const pagado = Number(datos.total_pagado);

    return {
        alquiler_id: Number(datos.alquiler_id),
        precio_alquiler: precio,
        total_pagado: pagado,
        saldo_pendiente: Math.max(0, precio - pagado),
        deposito_garantia: Number(datos.deposito_garantia),
        deposito_actual: Number(datos.deposito_actual)
    };
};