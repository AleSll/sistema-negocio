import { Request, Response } from "express";
import {
    listarVentas,
    registrarVentaConStock
} from "../models/venta.model";
import { pool } from "../config/database";

export const obtenerVentas = async (
    req: Request,
    res: Response
) => {
    try {
        const ventas = await listarVentas();
        return res.json(ventas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje: "Error al obtener las ventas"
        });
    }
};

export const crearVenta = async (
    req: Request,
    res: Response
) => {
    const {
        cliente_id,
        producto_id,
        cantidad,
        precio_unitario,
        costo_unitario,
        observacion
    } = req.body;

    if (
        cliente_id !== undefined &&
        cliente_id !== null &&
        (!Number.isInteger(cliente_id) || cliente_id <= 0)
    ) {
        return res.status(400).json({
            mensaje: "El ID del cliente no es válido"
        });
    }

    if (!Number.isInteger(producto_id) || producto_id <= 0) {
        return res.status(400).json({
            mensaje: "El ID del producto debe ser un entero positivo"
        });
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return res.status(400).json({
            mensaje: "La cantidad debe ser un entero positivo"
        });
    }

    if (
        typeof precio_unitario !== "number" ||
        !Number.isFinite(precio_unitario) ||
        precio_unitario < 0
    ) {
        return res.status(400).json({
            mensaje: "El precio unitario debe ser mayor o igual a cero"
        });
    }

    if (
        typeof costo_unitario !== "number" ||
        !Number.isFinite(costo_unitario) ||
        costo_unitario < 0
    ) {
        return res.status(400).json({
            mensaje: "El costo unitario debe ser mayor o igual a cero"
        });
    }

    if (
        observacion !== undefined &&
        observacion !== null &&
        typeof observacion !== "string"
    ) {
        return res.status(400).json({
            mensaje: "La observación debe ser texto"
        });
    }

    try {
        // Comprobar que el producto exista.
        const producto = await pool.query(
            "SELECT id FROM productos WHERE id = $1",
            [producto_id]
        );

        if (producto.rowCount === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        // Si se indicó un cliente, comprobar que exista.
        if (cliente_id !== undefined && cliente_id !== null) {
            const cliente = await pool.query(
                "SELECT id FROM clientes WHERE id = $1",
                [cliente_id]
            );

            if (cliente.rowCount === 0) {
                return res.status(404).json({
                    mensaje: "Cliente no encontrado"
                });
            }
        }

        const venta = await registrarVentaConStock(
            cliente_id ?? null,
            producto_id,
            cantidad,
            precio_unitario,
            costo_unitario,
            observacion?.trim() || null
        );

        return res.status(201).json({
            mensaje: "Venta registrada correctamente",
            venta,
            total_venta: Number(
                (cantidad * precio_unitario).toFixed(2)
            ),
            ganancia_bruta: Number(
                (cantidad * (precio_unitario - costo_unitario)).toFixed(2)
            )
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "PRODUCTO_NO_ENCONTRADO") {
                return res.status(404).json({
                    mensaje: "Producto no encontrado"
                });
            }

            if (error.message === "STOCK_INSUFICIENTE") {
                return res.status(400).json({
                    mensaje: "No hay suficiente stock para esta venta"
                });
            }
        }

        console.error(error);

        return res.status(500).json({
            mensaje: "Error al registrar la venta"
        });
    }
};