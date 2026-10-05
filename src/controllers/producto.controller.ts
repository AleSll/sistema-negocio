import { Request, Response } from "express";

import {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from "../models/producto.model";

export const listarProductos = async (req: Request, res: Response) => {
    try {
        const productos = await obtenerProductos();

        res.json(productos);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener productos"
        });
    }
};

export const buscarProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número"
            });
        }

        const producto = await obtenerProductoPorId(id);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json(producto);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al obtener producto"
        });
    }
};

export const registrarProducto = async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;

        // Validar nombre
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({
                mensaje: "El nombre es obligatorio"
            });
        }

        // Validar precio
        if (precio === undefined || precio === null || precio < 0) {
            return res.status(400).json({
                mensaje: "El precio debe ser mayor o igual a 0"
            });
        }

        // Validar stock
        if (stock === undefined || stock === null || stock < 0) {
            return res.status(400).json({
                mensaje: "El stock debe ser mayor o igual a 0"
            });
        }

        const producto = await crearProducto(
            nombre,
            descripcion,
            precio,
            stock
        );

        res.status(201).json(producto);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al crear producto"
        });
    }
};

export const modificarProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número"
            });
        }        
        const { nombre, descripcion, precio, stock } = req.body;

        // Validar nombre
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({
                mensaje: "El nombre es obligatorio"
            });
        }

        // Validar precio
        if (precio === undefined || precio === null || precio < 0) {
            return res.status(400).json({
                mensaje: "El precio debe ser mayor o igual a 0"
            });
        }

        // Validar stock
        if (stock === undefined || stock === null || stock < 0) {
            return res.status(400).json({
                mensaje: "El stock debe ser mayor o igual a 0"
            });
        }

        const producto = await actualizarProducto(
            id,
            nombre,
            descripcion,
            precio,
            stock
        );

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json(producto);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al actualizar producto"
        });
    }
};


export const borrarProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número"
            });
        }

        const producto = await eliminarProducto(id);

        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.json({
            mensaje: "Producto eliminado correctamente",
            producto
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: "Error al eliminar producto"
        });
    }
};