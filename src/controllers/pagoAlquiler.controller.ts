import { Request, Response } from "express";
import { pool } from "../config/database";
import {
    registrarPagoAlquiler,
    listarPagosAlquiler,
    obtenerResumenAlquiler
} from "../models/pagoAlquiler.model";

// Registrar un pago o movimiento de garantía
export const crearPagoAlquiler = async (
    req: Request,
    res: Response
) => {
    const conexion = await pool.connect();

    try {
        const alquiler_id = Number(req.params.id);
        const {
            monto,
            tipo_pago,
            metodo_pago = null,
            observacion = null
        } = req.body;

        const importe = Number(monto);

        const tiposPermitidos = [
            "alquiler",
            "deposito",
            "devolucion_deposito"
        ];

        const metodosPermitidos = [
            "efectivo",
            "transferencia",
            "tarjeta",
            "otro"
        ];

        if (!Number.isInteger(alquiler_id) || alquiler_id <= 0) {
            res.status(400).json({
                mensaje: "ID de alquiler inválido"
            });
            return;
        }

        if (!Number.isFinite(importe) || importe <= 0) {
            res.status(400).json({
                mensaje: "El monto debe ser mayor que cero"
            });
            return;
        }

        if (!tiposPermitidos.includes(tipo_pago)) {
            res.status(400).json({
                mensaje: "Tipo de pago inválido",
                tipos_permitidos: tiposPermitidos
            });
            return;
        }

        if (
            metodo_pago !== null &&
            !metodosPermitidos.includes(metodo_pago)
        ) {
            res.status(400).json({
                mensaje: "Método de pago inválido"
            });
            return;
        }

        if (
            observacion !== null &&
            typeof observacion !== "string"
        ) {
            res.status(400).json({
                mensaje: "La observación debe ser texto"
            });
            return;
        }

        await conexion.query("BEGIN");

        // Bloquear el alquiler mientras validamos el movimiento
        const resultadoAlquiler = await conexion.query(
            `SELECT id, precio_alquiler, deposito_garantia
             FROM alquileres
             WHERE id = $1
             FOR UPDATE`,
            [alquiler_id]
        );

        if (resultadoAlquiler.rowCount === 0) {
            await conexion.query("ROLLBACK");
            res.status(404).json({
                mensaje: "Alquiler no encontrado"
            });
            return;
        }

        const alquiler = resultadoAlquiler.rows[0];

        if (tipo_pago === "alquiler") {
            const resultadoPagado = await conexion.query(
                `SELECT COALESCE(SUM(monto), 0) AS total
                 FROM pagos_alquileres
                 WHERE alquiler_id = $1
                   AND tipo_pago = 'alquiler'`,
                [alquiler_id]
            );

            const totalPagado = Number(resultadoPagado.rows[0].total);
            const precio = Number(alquiler.precio_alquiler);
            const saldo = precio - totalPagado;

            if (importe > saldo + 0.001) {
                await conexion.query("ROLLBACK");
                res.status(400).json({
                    mensaje: "El pago supera el saldo pendiente del alquiler",
                    saldo_pendiente: Math.max(0, saldo)
                });
                return;
            }
        }

        if (tipo_pago === "deposito") {
            const resultadoDepositos = await conexion.query(
                `SELECT COALESCE(SUM(
                    CASE
                        WHEN tipo_pago = 'deposito' THEN monto
                        WHEN tipo_pago = 'devolucion_deposito' THEN -monto
                        ELSE 0
                    END
                ), 0) AS saldo
                FROM pagos_alquileres
                WHERE alquiler_id = $1`,
                [alquiler_id]
            );

            const saldoDeposito = Number(resultadoDepositos.rows[0].saldo);
            const garantiaAcordada = Number(alquiler.deposito_garantia);

            if (saldoDeposito + importe > garantiaAcordada + 0.001) {
                await conexion.query("ROLLBACK");
                res.status(400).json({
                    mensaje: "El depósito supera la garantía acordada",
                    garantia_acordada: garantiaAcordada,
                    deposito_pendiente: Math.max(
                        0,
                        garantiaAcordada - saldoDeposito
                    )
                });
                return;
            }
        }

        if (tipo_pago === "devolucion_deposito") {
            const resultadoDepositos = await conexion.query(
                `SELECT COALESCE(SUM(
                    CASE
                        WHEN tipo_pago = 'deposito' THEN monto
                        WHEN tipo_pago = 'devolucion_deposito' THEN -monto
                        ELSE 0
                    END
                ), 0) AS saldo
                FROM pagos_alquileres
                WHERE alquiler_id = $1`,
                [alquiler_id]
            );

            const saldoDeposito = Number(resultadoDepositos.rows[0].saldo);

            if (importe > saldoDeposito + 0.001) {
                await conexion.query("ROLLBACK");
                res.status(400).json({
                    mensaje: "La devolución supera el depósito recibido",
                    deposito_disponible: Math.max(0, saldoDeposito)
                });
                return;
            }
        }

        // Registrar el movimiento dentro de la transacción
        const resultadoPago = await conexion.query(
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
                importe,
                tipo_pago,
                metodo_pago,
                observacion
            ]
        );

        await conexion.query("COMMIT");

        res.status(201).json({
            mensaje: "Movimiento registrado correctamente",
            pago: resultadoPago.rows[0]
        });
    } catch (error) {
        await conexion.query("ROLLBACK");
        console.error(error);

        res.status(500).json({
            mensaje: "Error al registrar el movimiento"
        });
    } finally {
        conexion.release();
    }
};

// Consultar los movimientos de un alquiler
export const obtenerPagosAlquiler = async (
    req: Request,
    res: Response
) => {
    try {
        const alquiler_id = Number(req.params.id);

        if (!Number.isInteger(alquiler_id) || alquiler_id <= 0) {
            res.status(400).json({
                mensaje: "ID de alquiler inválido"
            });
            return;
        }

        const pagos = await listarPagosAlquiler(alquiler_id);

        res.json(pagos);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al consultar los movimientos"
        });
    }
};
// Consultar el resumen financiero de un alquiler
export const resumenFinancieroAlquiler = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                mensaje: "ID de alquiler inválido"
            });
            return;
        }

        const resumen = await obtenerResumenAlquiler(id);

        if (!resumen) {
            res.status(404).json({
                mensaje: "Alquiler no encontrado"
            });
            return;
        }

        res.json(resumen);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener el resumen financiero"
        });
    }
};