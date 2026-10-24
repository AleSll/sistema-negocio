import { pool } from "../config/database";

// ======================================================
// CONSULTAR PAGOS DE UN ALQUILER
// ======================================================

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

// ======================================================
// OBTENER RESUMEN FINANCIERO
// ======================================================

export const obtenerResumenAlquiler = async (
    alquiler_id: number
) => {
    const resultado = await pool.query(
        `SELECT
            a.id AS alquiler_id,
            a.estado,
            a.cantidad,
            a.precio_alquiler,
            a.deposito_garantia,

            COALESCE(
                SUM(p.monto) FILTER (
                    WHERE
                        p.tipo_pago = 'alquiler'
                ),
                0
            ) AS total_pagado,

            COALESCE(
                SUM(p.monto) FILTER (
                    WHERE
                        p.tipo_pago = 'deposito'
                ),
                0
            ) AS total_depositado,

            COALESCE(
                SUM(p.monto) FILTER (
                    WHERE
                        p.tipo_pago =
                        'devolucion_deposito'
                ),
                0
            ) AS total_deposito_devuelto

         FROM alquileres a

         LEFT JOIN pagos_alquileres p
            ON p.alquiler_id = a.id

         WHERE a.id = $1

         GROUP BY
            a.id,
            a.estado,
            a.cantidad,
            a.precio_alquiler,
            a.deposito_garantia`,
        [alquiler_id]
    );

    if (resultado.rowCount === 0) {
        return null;
    }

    const datos = resultado.rows[0];

    const precioTotal =
        Number(datos.precio_alquiler);

    const cantidad =
        Number(datos.cantidad);

    const totalPagado =
        Number(datos.total_pagado);

    const garantia =
        Number(datos.deposito_garantia);

    const totalDepositado =
        Number(datos.total_depositado);

    const totalDevuelto =
        Number(
            datos.total_deposito_devuelto
        );

    const depositoActual =
        totalDepositado -
        totalDevuelto;

    const precioUnitario =
        cantidad > 0
            ? precioTotal / cantidad
            : 0;

    // La garantía pendiente representa cuánto faltó
    // recibir originalmente del cliente.
    //
    // No debe volver a aparecer como pendiente después
    // de devolver la garantía.
    const depositoPendiente =
        Math.max(
            0,
            garantia - totalDepositado
        );

    return {
        alquiler_id:
            Number(datos.alquiler_id),

        estado:
            datos.estado,

        cantidad,

        precio_unitario:
            Number(
                precioUnitario.toFixed(2)
            ),

        precio_total:
            precioTotal,

        total_pagado:
            totalPagado,

        saldo_pendiente:
            Math.max(
                0,
                precioTotal -
                    totalPagado
            ),

        deposito_garantia:
            garantia,

        total_depositado:
            totalDepositado,

        total_deposito_devuelto:
            totalDevuelto,

        deposito_actual:
            depositoActual,

        deposito_pendiente:
            depositoPendiente
    };
};