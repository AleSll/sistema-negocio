import { Request, Response } from "express";
import { pool } from "../config/database";
import {
    registrarPago,
    obtenerPagosPorPedido
} from "../models/pago.model";

export const registrarPagoPedido = async (
    req: Request,
    res: Response
) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            mensaje: "El ID del pedido debe ser numérico"
        });
    }

    const { monto, metodo_pago, observacion } = req.body;

    if (
        typeof monto !== "number" ||
        !Number.isFinite(monto) ||
        monto <= 0
    ) {
        return res.status(400).json({
            mensaje: "El monto debe ser mayor que cero"
        });
    }

    const metodosPermitidos = [
        "efectivo",
        "transferencia",
        "tarjeta",
        "otro"
    ];

    if (
        metodo_pago != null &&
        !metodosPermitidos.includes(metodo_pago)
    ) {
        return res.status(400).json({
            mensaje: "Método de pago no válido"
        });
    }

    if (
        observacion != null &&
        typeof observacion !== "string"
    ) {
        return res.status(400).json({
            mensaje: "La observación debe ser texto"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const resultadoPedido = await client.query(
            `SELECT precio_acordado
             FROM pedidos
             WHERE id = $1
             FOR UPDATE`,
            [Number(id)]
        );

        if (resultadoPedido.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });
        }

        const resultadoPagos = await client.query(
            `SELECT COALESCE(SUM(monto), 0) AS total_pagado
             FROM pagos_pedidos
             WHERE pedido_id = $1`,
            [Number(id)]
        );

        const precio = Number(
            resultadoPedido.rows[0].precio_acordado
        );

        const totalPagado = Number(
            resultadoPagos.rows[0].total_pagado
        );

        const saldo = precio - totalPagado;

        if (monto > saldo + 0.000001) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                mensaje: "El pago supera el saldo pendiente",
                saldo_pendiente: Math.max(0, saldo)
            });
        }

        const resultadoPago = await client.query(
            `INSERT INTO pagos_pedidos
             (pedido_id, monto, metodo_pago, observacion)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                Number(id),
                monto,
                metodo_pago ?? null,
                observacion?.trim() || null
            ]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            mensaje: "Pago registrado correctamente",
            pago: resultadoPago.rows[0],
            total_pagado: Number(
                (totalPagado + monto).toFixed(2)
            ),
            saldo_pendiente: Number(
                (saldo - monto).toFixed(2)
            )
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);

        return res.status(500).json({
            mensaje: "Error al registrar el pago"
        });
    } finally {
        client.release();
    }
};

export const listarPagosPedido = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                mensaje: "El ID del pedido debe ser numérico"
            });
        }

        const pagos = await obtenerPagosPorPedido(
            Number(id)
        );

        return res.json(pagos);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: "Error al obtener los pagos"
        });
    }
};