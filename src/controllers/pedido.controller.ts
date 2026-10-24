import { Request, Response } from "express";
import {
    listarPedidos,
    crearPedido,
    obtenerPedidoPorId
} from "../models/pedido.model";

export const obtenerPedidos = async (
    req: Request,
    res: Response
) => {
    try {
        const pedidos = await listarPedidos();
        return res.json(pedidos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje: "Error al obtener pedidos"
        });
    }
};

export const registrarPedido = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            cliente_id,
            tipo,
            descripcion,
            medidas,
            precio_acordado,
            fecha_entrega
        } = req.body;

        if (
            !Number.isInteger(cliente_id) ||
            cliente_id <= 0
        ) {
            return res.status(400).json({
                mensaje: "El ID del cliente debe ser un entero positivo"
            });
        }

        if (!["confeccion", "arreglo"].includes(tipo)) {
            return res.status(400).json({
                mensaje: "El tipo debe ser confeccion o arreglo"
            });
        }

        if (
            typeof descripcion !== "string" ||
            descripcion.trim() === ""
        ) {
            return res.status(400).json({
                mensaje: "La descripción es obligatoria"
            });
        }

        if (
            typeof precio_acordado !== "number" ||
            !Number.isFinite(precio_acordado) ||
            precio_acordado < 0
        ) {
            return res.status(400).json({
                mensaje: "El precio debe ser un número mayor o igual a cero"
            });
        }

        const pedido = await crearPedido(
            cliente_id,
            tipo,
            descripcion.trim(),
            typeof medidas === "string"
                ? medidas.trim() || null
                : null,
            precio_acordado,
            typeof fecha_entrega === "string" &&
            fecha_entrega.trim() !== ""
                ? fecha_entrega
                : null
        );

        return res.status(201).json(pedido);
    } catch (error: any) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                mensaje: "El cliente indicado no existe"
            });
        }

        return res.status(500).json({
            mensaje: "Error al registrar pedido"
        });
    }
};
export const obtenerPedido = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser numérico"
            });
        }

        const pedido = await obtenerPedidoPorId(Number(id));

        if (!pedido) {
            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });
        }

        return res.json(pedido);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: "Error al obtener el pedido"
        });
    }
};