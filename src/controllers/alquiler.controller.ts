import { Request, Response } from "express";
import { pool } from "../config/database";
import {
    listarAlquileres,
    obtenerAlquilerPorId
} from "../models/alquiler.model";

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

// Validar formato y existencia real de una fecha YYYY-MM-DD
const fechaValida = (fecha: unknown): fecha is string => {
    if (
        typeof fecha !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return false;
    }

    const fechaParseada = new Date(`${fecha}T00:00:00.000Z`);

    return (
        !Number.isNaN(fechaParseada.getTime()) &&
        fechaParseada.toISOString().slice(0, 10) === fecha
    );
};

// ======================================================
// LISTAR ALQUILERES
// ======================================================

export const listar = async (req: Request, res: Response) => {
    try {
        const alquileres = await listarAlquileres();

        res.json(alquileres);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al listar los alquileres"
        });
    }
};

// ======================================================
// OBTENER ALQUILER POR ID
// ======================================================

export const obtenerPorId = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                mensaje: "ID inválido"
            });
            return;
        }

        const alquiler = await obtenerAlquilerPorId(id);

        if (!alquiler) {
            res.status(404).json({
                mensaje: "Alquiler no encontrado"
            });
            return;
        }

        res.json(alquiler);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener el alquiler"
        });
    }
};

// ======================================================
// CREAR ALQUILER
// ======================================================

export const crear = async (
    req: Request,
    res: Response
) => {
    const {
        cliente_id,
        producto_id,
        fecha_alquiler,
        fecha_devolucion,
        cantidad = 1,
        precio_alquiler,
        deposito_garantia = 0,
        observacion = null
    } = req.body;

    const clienteId = Number(cliente_id);
    const productoId = Number(producto_id);
    const precio = Number(precio_alquiler);
    const deposito = Number(deposito_garantia);
    const cantidadSolicitada = Number(cantidad);

    // ------------------------------
    // Validar IDs
    // ------------------------------

    if (
        !Number.isInteger(clienteId) ||
        clienteId <= 0 ||
        !Number.isInteger(productoId) ||
        productoId <= 0
    ) {
        res.status(400).json({
            mensaje:
                "El ID del cliente y del producto debe ser válido"
        });
        return;
    }

    // ------------------------------
    // Validar cantidad
    // ------------------------------

    if (
        !Number.isInteger(cantidadSolicitada) ||
        cantidadSolicitada <= 0
    ) {
        res.status(400).json({
            mensaje:
                "La cantidad debe ser un número entero mayor que cero"
        });
        return;
    }

    // ------------------------------
    // Validar fechas
    // ------------------------------

    if (
        !fechaValida(fecha_alquiler) ||
        !fechaValida(fecha_devolucion) ||
        fecha_devolucion < fecha_alquiler
    ) {
        res.status(400).json({
            mensaje:
                "Las fechas no son válidas o la devolución es anterior al alquiler"
        });
        return;
    }

    // ------------------------------
    // Validar precio y depósito
    // ------------------------------

    if (
        !Number.isFinite(precio) ||
        precio < 0 ||
        !Number.isFinite(deposito) ||
        deposito < 0
    ) {
        res.status(400).json({
            mensaje:
                "El precio y el depósito deben ser números no negativos"
        });
        return;
    }

    // ------------------------------
    // Validar observación
    // ------------------------------

    if (
        observacion !== null &&
        typeof observacion !== "string"
    ) {
        res.status(400).json({
            mensaje: "La observación debe ser un texto"
        });
        return;
    }

    let conexion;

    try {
        // ------------------------------
        // Comprobar cliente
        // ------------------------------

        const cliente = await pool.query(
            "SELECT id FROM clientes WHERE id = $1",
            [clienteId]
        );

        if (cliente.rowCount === 0) {
            res.status(404).json({
                mensaje: "El cliente no existe"
            });
            return;
        }

        conexion = await pool.connect();

        try {
            await conexion.query("BEGIN");

            // ------------------------------
            // Bloquear producto
            // ------------------------------

            const productoResultado =
                await conexion.query(
                    `SELECT
                        id,
                        stock,
                        precio_alquiler
                     FROM productos
                     WHERE id = $1
                     FOR UPDATE`,
                    [productoId]
                );

            if (productoResultado.rowCount === 0) {
                await conexion.query("ROLLBACK");

                res.status(404).json({
                    mensaje: "El producto no existe"
                });
                return;
            }

            const producto =
                productoResultado.rows[0];

            if (producto.precio_alquiler === null) {
                await conexion.query("ROLLBACK");

                res.status(400).json({
                    mensaje:
                        "Este producto no tiene un precio de alquiler configurado"
                });
                return;
            }

            const stockTotal =
                Number(producto.stock);

            // ------------------------------
            // Calcular unidades reservadas
            // ------------------------------

            const reservas =
                await conexion.query(
                    `SELECT
                        COALESCE(SUM(cantidad), 0)
                        AS unidades_reservadas
                     FROM alquileres
                     WHERE producto_id = $1
                       AND estado IN (
                           'reservado',
                           'alquilado'
                       )
                       AND fecha_alquiler <= $3::date
                       AND fecha_devolucion >= $2::date`,
                    [
                        productoId,
                        fecha_alquiler,
                        fecha_devolucion
                    ]
                );

            const unidadesReservadas =
                Number(
                    reservas.rows[0]
                        .unidades_reservadas
                );

            const unidadesDisponibles =
                stockTotal - unidadesReservadas;

            // ------------------------------
            // Comprobar disponibilidad
            // ------------------------------

            if (
                cantidadSolicitada >
                unidadesDisponibles
            ) {
                await conexion.query("ROLLBACK");

                res.status(409).json({
                    mensaje:
                        "No hay suficientes unidades disponibles para esas fechas",
                    stock_total: stockTotal,
                    unidades_reservadas:
                        unidadesReservadas,
                    unidades_disponibles:
                        unidadesDisponibles,
                    cantidad_solicitada:
                        cantidadSolicitada
                });
                return;
            }

            // ------------------------------
            // Registrar alquiler
            // ------------------------------

            const resultado =
                await conexion.query(
                    `INSERT INTO alquileres (
                        cliente_id,
                        producto_id,
                        fecha_alquiler,
                        fecha_devolucion,
                        precio_alquiler,
                        deposito_garantia,
                        observacion,
                        cantidad
                    )
                    VALUES (
                        $1, $2, $3, $4,
                        $5, $6, $7, $8
                    )
                    RETURNING *`,
                    [
                        clienteId,
                        productoId,
                        fecha_alquiler,
                        fecha_devolucion,
                        precio,
                        deposito,
                        observacion,
                        cantidadSolicitada
                    ]
                );

            await conexion.query("COMMIT");

            res.status(201).json({
                mensaje:
                    "Alquiler registrado correctamente",
                alquiler: resultado.rows[0]
            });
        } catch (error) {
            await conexion.query("ROLLBACK");
            throw error;
        } finally {
            conexion.release();
        }
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al registrar el alquiler"
        });
    }
};

// ======================================================
// ACTUALIZAR ESTADO DEL ALQUILER
// ======================================================

export const actualizarEstado = async (
    req: Request,
    res: Response
) => {
    const id = Number(req.params.id);
    const { estado } = req.body;

    const estadosPermitidos = [
        "reservado",
        "alquilado",
        "devuelto",
        "cancelado"
    ];

    // ------------------------------
    // Validar ID
    // ------------------------------

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            mensaje: "ID de alquiler inválido"
        });
        return;
    }

    // ------------------------------
    // Validar estado
    // ------------------------------

    if (
        typeof estado !== "string" ||
        !estadosPermitidos.includes(estado)
    ) {
        res.status(400).json({
            mensaje: "Estado inválido",
            estados_permitidos:
                estadosPermitidos
        });
        return;
    }

    let conexion;

    try {
        conexion = await pool.connect();

        try {
            await conexion.query("BEGIN");

            // ------------------------------
            // Obtener y bloquear alquiler
            // ------------------------------

            const alquilerResultado =
                await conexion.query(
                    `SELECT *
                     FROM alquileres
                     WHERE id = $1
                     FOR UPDATE`,
                    [id]
                );

            if (alquilerResultado.rowCount === 0) {
                await conexion.query("ROLLBACK");

                res.status(404).json({
                    mensaje:
                        "Alquiler no encontrado"
                });
                return;
            }

            const alquiler =
                alquilerResultado.rows[0];

            const estadoActual =
                alquiler.estado;

            // ------------------------------
            // Mismo estado
            // ------------------------------

            if (estadoActual === estado) {
                await conexion.query("ROLLBACK");

                res.status(400).json({
                    mensaje:
                        `El alquiler ya se encuentra en estado '${estadoActual}'`
                });
                return;
            }

            // ------------------------------
            // Definir transiciones válidas
            // ------------------------------

            const transicionesPermitidas:
                Record<string, string[]> = {
                    reservado: [
                        "alquilado",
                        "cancelado"
                    ],
                    alquilado: [
                        "devuelto"
                    ],
                    devuelto: [],
                    cancelado: []
                };

            const siguientesEstados =
                transicionesPermitidas[
                    estadoActual
                ] ?? [];

            if (
                !siguientesEstados.includes(estado)
            ) {
                await conexion.query("ROLLBACK");

                res.status(409).json({
                    mensaje:
                        `No se puede cambiar un alquiler de '${estadoActual}' a '${estado}'`,
                    estado_actual:
                        estadoActual,
                    estados_permitidos:
                        siguientesEstados
                });
                return;
            }

            // ------------------------------
            // Si pasa de reservado a alquilado,
            // bloquear también el producto.
            //
            // No necesitamos volver a sumar
            // este alquiler como nueva reserva,
            // porque reservado y alquilado ya
            // bloquean stock por igual.
            // ------------------------------

            if (
                estadoActual === "reservado" &&
                estado === "alquilado"
            ) {
                const productoResultado =
                    await conexion.query(
                        `SELECT id, stock
                         FROM productos
                         WHERE id = $1
                         FOR UPDATE`,
                        [alquiler.producto_id]
                    );

                if (
                    productoResultado.rowCount === 0
                ) {
                    await conexion.query(
                        "ROLLBACK"
                    );

                    res.status(404).json({
                        mensaje:
                            "El producto asociado al alquiler no existe"
                    });
                    return;
                }
            }

            // ------------------------------
            // Actualizar estado
            // ------------------------------

            const resultado =
                await conexion.query(
                    `UPDATE alquileres
                     SET estado = $1
                     WHERE id = $2
                     RETURNING *`,
                    [estado, id]
                );

            await conexion.query("COMMIT");

            res.json({
                mensaje:
                    "Estado del alquiler actualizado correctamente",
                estado_anterior:
                    estadoActual,
                estado_nuevo:
                    estado,
                alquiler:
                    resultado.rows[0]
            });
        } catch (error) {
            await conexion.query("ROLLBACK");
            throw error;
        } finally {
            conexion.release();
        }
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al actualizar el estado del alquiler"
        });
    }
};

// ======================================================
// CONSULTAR DISPONIBILIDAD
// ======================================================

export const consultarDisponibilidad = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            fecha_inicio,
            fecha_fin
        } = req.query;

        // ------------------------------
        // Validar fechas
        // ------------------------------

        if (
            !fechaValida(fecha_inicio) ||
            !fechaValida(fecha_fin) ||
            fecha_fin < fecha_inicio
        ) {
            res.status(400).json({
                mensaje:
                    "Debes proporcionar fechas válidas",
                ejemplo: {
                    fecha_inicio:
                        "2026-11-10",
                    fecha_fin:
                        "2026-11-12"
                }
            });
            return;
        }

        // ------------------------------
        // Consultar productos alquilables
        // ------------------------------

        const resultado =
            await pool.query(
                `SELECT
                    p.id,
                    p.nombre,
                    p.categoria,
                    p.talla,
                    p.color,
                    p.precio_alquiler,
                    p.stock AS stock_total,

                    COALESCE(
                        r.unidades_reservadas,
                        0
                    )::integer
                    AS unidades_reservadas,

                    GREATEST(
                        p.stock -
                        COALESCE(
                            r.unidades_reservadas,
                            0
                        ),
                        0
                    )::integer
                    AS unidades_disponibles,

                    CASE
                        WHEN
                            p.stock -
                            COALESCE(
                                r.unidades_reservadas,
                                0
                            ) > 0
                        THEN 'Disponible'
                        ELSE 'No disponible'
                    END
                    AS disponibilidad

                 FROM productos p

                 LEFT JOIN LATERAL (
                    SELECT
                        SUM(a.cantidad)
                        AS unidades_reservadas

                    FROM alquileres a

                    WHERE
                        a.producto_id = p.id

                        AND a.estado IN (
                            'reservado',
                            'alquilado'
                        )

                        AND
                        a.fecha_alquiler
                        <= $2::date

                        AND
                        a.fecha_devolucion
                        >= $1::date

                 ) r ON TRUE

                 WHERE
                    p.precio_alquiler
                    IS NOT NULL

                 ORDER BY p.nombre`,
                [
                    fecha_inicio,
                    fecha_fin
                ]
            );

        res.json({
            fecha_inicio,
            fecha_fin,
            productos:
                resultado.rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al consultar la disponibilidad"
        });
    }
};