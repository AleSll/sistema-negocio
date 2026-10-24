import { Request, Response } from "express";
import {
    listarClientes,
    buscarClientePorId,
    crearCliente
} from "../models/cliente.model";

export const obtenerClientes = async (
    req: Request,
    res: Response
) => {
    try {
        const clientes = await listarClientes();
        return res.json(clientes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje: "Error al obtener clientes"
        });
    }
};

export const obtenerCliente = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número"
            });
        }

        const cliente = await buscarClientePorId(id);

        if (!cliente) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        return res.json(cliente);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje: "Error al obtener cliente"
        });
    }
};

export const registrarCliente = async (
    req: Request,
    res: Response
) => {
    try {
        const { nombre, telefono } = req.body;

        if (typeof nombre !== "string" || nombre.trim() === "") {
            return res.status(400).json({
                mensaje: "El nombre es obligatorio"
            });
        }

        if (
            telefono !== undefined &&
            telefono !== null &&
            typeof telefono !== "string"
        ) {
            return res.status(400).json({
                mensaje: "El teléfono debe ser texto"
            });
        }

        const cliente = await crearCliente(
            nombre.trim(),
            telefono?.trim() || null
        );

        return res.status(201).json(cliente);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje: "Error al registrar cliente"
        });
    }
};