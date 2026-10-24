import { pool } from "../config/database";

// ======================================================
// RESUMEN GENERAL DEL DASHBOARD
// ======================================================

export const obtenerResumenDashboard = async () => {
    const resultado = await pool.query(
        `SELECT
            -- ==========================================
            -- INFORMACIÓN OPERATIVA
            -- ==========================================

            COUNT(*) FILTER (
                WHERE a.estado IN (
                    'reservado',
                    'alquilado'
                )
            )::integer AS alquileres_activos,

            COALESCE(
                SUM(a.cantidad) FILTER (
                    WHERE a.estado IN (
                        'reservado',
                        'alquilado'
                    )
                ),
                0
            )::integer AS unidades_comprometidas,

            -- ==========================================
            -- INFORMACIÓN FINANCIERA
            -- ==========================================

            COALESCE(
                SUM(
                    CASE
                        WHEN a.estado <> 'cancelado'
                        THEN GREATEST(
                            a.precio_alquiler -
                            COALESCE(
                                p.total_pagado,
                                0
                            ),
                            0
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS total_por_cobrar,

            COALESCE(
                SUM(
                    GREATEST(
                        COALESCE(
                            p.deposito_actual,
                            0
                        ),
                        0
                    )
                ),
                0
            ) AS garantias_en_poder

         FROM alquileres a

         LEFT JOIN LATERAL (
            SELECT
                COALESCE(
                    SUM(pa.monto) FILTER (
                        WHERE
                            pa.tipo_pago = 'alquiler'
                    ),
                    0
                ) AS total_pagado,

                COALESCE(
                    SUM(pa.monto) FILTER (
                        WHERE
                            pa.tipo_pago = 'deposito'
                    ),
                    0
                )
                -
                COALESCE(
                    SUM(pa.monto) FILTER (
                        WHERE
                            pa.tipo_pago =
                            'devolucion_deposito'
                    ),
                    0
                ) AS deposito_actual

            FROM pagos_alquileres pa

            WHERE
                pa.alquiler_id = a.id

         ) p ON TRUE`
    );

    const datos = resultado.rows[0];

    return {
        alquileres_activos:
            Number(
                datos.alquileres_activos
            ),

        unidades_comprometidas:
            Number(
                datos.unidades_comprometidas
            ),

        total_por_cobrar:
            Number(
                datos.total_por_cobrar
            ),

        garantias_en_poder:
            Number(
                datos.garantias_en_poder
            )
    };
};

// ======================================================
// LISTAR ALQUILERES ACTIVOS Y PENDIENTES FINANCIEROS
// ======================================================

export const listarAlquileresPendientes = async () => {
    const resultado = await pool.query(
        `SELECT
            a.id AS alquiler_id,

            a.estado,

            a.fecha_alquiler,
            a.fecha_devolucion,

            a.cantidad,

            c.id AS cliente_id,
            c.nombre AS cliente_nombre,
            c.telefono AS cliente_telefono,

            pr.id AS producto_id,
            pr.nombre AS producto_nombre,
            pr.talla,
            pr.color,

            a.precio_alquiler
                AS precio_total,

            COALESCE(
                SUM(pa.monto) FILTER (
                    WHERE
                        pa.tipo_pago = 'alquiler'
                ),
                0
            ) AS total_pagado,

            GREATEST(
                a.precio_alquiler -
                COALESCE(
                    SUM(pa.monto) FILTER (
                        WHERE
                            pa.tipo_pago =
                            'alquiler'
                    ),
                    0
                ),
                0
            ) AS saldo_pendiente,

            a.deposito_garantia,

            COALESCE(
                SUM(pa.monto) FILTER (
                    WHERE
                        pa.tipo_pago =
                        'deposito'
                ),
                0
            ) AS total_depositado,

            COALESCE(
                SUM(pa.monto) FILTER (
                    WHERE
                        pa.tipo_pago =
                        'devolucion_deposito'
                ),
                0
            ) AS total_deposito_devuelto,

            COALESCE(
                SUM(pa.monto) FILTER (
                    WHERE
                        pa.tipo_pago =
                        'deposito'
                ),
                0
            )
            -
            COALESCE(
                SUM(pa.monto) FILTER (
                    WHERE
                        pa.tipo_pago =
                        'devolucion_deposito'
                ),
                0
            ) AS deposito_actual

         FROM alquileres a

         INNER JOIN clientes c
            ON c.id = a.cliente_id

         INNER JOIN productos pr
            ON pr.id = a.producto_id

         LEFT JOIN pagos_alquileres pa
            ON pa.alquiler_id = a.id

         WHERE
            a.estado IN (
                'reservado',
                'alquilado'
            )

            OR (
                a.estado = 'devuelto'

                AND (
                    a.precio_alquiler >
                    COALESCE(
                        (
                            SELECT SUM(pa2.monto)
                            FROM pagos_alquileres pa2
                            WHERE
                                pa2.alquiler_id = a.id
                                AND pa2.tipo_pago =
                                    'alquiler'
                        ),
                        0
                    )

                    OR

                    COALESCE(
                        (
                            SELECT SUM(
                                CASE
                                    WHEN pa3.tipo_pago =
                                        'deposito'
                                    THEN pa3.monto

                                    WHEN pa3.tipo_pago =
                                        'devolucion_deposito'
                                    THEN -pa3.monto

                                    ELSE 0
                                END
                            )
                            FROM pagos_alquileres pa3
                            WHERE
                                pa3.alquiler_id = a.id
                        ),
                        0
                    ) > 0
                )
            )

         GROUP BY
            a.id,
            a.estado,
            a.fecha_alquiler,
            a.fecha_devolucion,
            a.cantidad,
            c.id,
            c.nombre,
            c.telefono,
            pr.id,
            pr.nombre,
            pr.talla,
            pr.color,
            a.precio_alquiler,
            a.deposito_garantia

         ORDER BY
            a.fecha_alquiler ASC,
            a.id ASC`
    );

    return resultado.rows.map(
        (fila) => ({
            alquiler_id:
                Number(
                    fila.alquiler_id
                ),

            estado:
                fila.estado,

            fecha_alquiler:
                fila.fecha_alquiler,

            fecha_devolucion:
                fila.fecha_devolucion,

            cantidad:
                Number(
                    fila.cantidad
                ),

            cliente: {
                id:
                    Number(
                        fila.cliente_id
                    ),

                nombre:
                    fila.cliente_nombre,

                telefono:
                    fila.cliente_telefono
            },

            producto: {
                id:
                    Number(
                        fila.producto_id
                    ),

                nombre:
                    fila.producto_nombre,

                talla:
                    fila.talla,

                color:
                    fila.color
            },

            precio_total:
                Number(
                    fila.precio_total
                ),

            total_pagado:
                Number(
                    fila.total_pagado
                ),

            saldo_pendiente:
                Number(
                    fila.saldo_pendiente
                ),

            deposito_garantia:
                Number(
                    fila.deposito_garantia
                ),

            total_depositado:
                Number(
                    fila.total_depositado
                ),

            total_deposito_devuelto:
                Number(
                    fila.total_deposito_devuelto
                ),

            deposito_actual:
                Number(
                    fila.deposito_actual
                )
        })
    );
};