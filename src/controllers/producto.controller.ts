import { Request, Response } from "express";

import {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    actualizarFotoProducto,
    obtenerCatalogoProductos
} from "../models/producto.model";

// ======================================================
// LISTAR PRODUCTOS
// ======================================================

export const listarProductos = async (
    req: Request,
    res: Response
) => {
    try {
        const productos =
            await obtenerProductos();

        res.json(productos);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al obtener productos"
        });
    }
};

// ======================================================
// BUSCAR PRODUCTO
// ======================================================

export const buscarProducto = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            res.status(400).json({
                mensaje:
                    "El ID debe ser un número"
            });
            return;
        }

        const producto =
            await obtenerProductoPorId(id);

        if (!producto) {
            res.status(404).json({
                mensaje:
                    "Producto no encontrado"
            });
            return;
        }

        res.json(producto);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al obtener producto"
        });
    }
};

// ======================================================
// REGISTRAR PRODUCTO
// ======================================================

export const registrarProducto = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            nombre,
            descripcion = null,
            precio,
            stock,
            categoria = null,
            talla = null,
            color = null,
            precio_alquiler = null,
            costo = null,
            foto_url = null
        } = req.body;

        // ----------------------------------------------
        // Validar nombre
        // ----------------------------------------------

        if (
            typeof nombre !== "string" ||
            nombre.trim() === ""
        ) {
            res.status(400).json({
                mensaje:
                    "El nombre es obligatorio"
            });
            return;
        }

        // ----------------------------------------------
        // Convertir valores numéricos
        // ----------------------------------------------

        const precioNumero = Number(precio);
        const stockNumero = Number(stock);

        const precioAlquilerNumero =
            precio_alquiler === null ||
            precio_alquiler === ""
                ? null
                : Number(precio_alquiler);

        const costoNumero =
            costo === null ||
            costo === ""
                ? null
                : Number(costo);

        // ----------------------------------------------
        // Validar precio
        // ----------------------------------------------

        if (
            !Number.isFinite(precioNumero) ||
            precioNumero < 0
        ) {
            res.status(400).json({
                mensaje:
                    "El precio debe ser un número mayor o igual a 0"
            });
            return;
        }

        // ----------------------------------------------
        // Validar stock
        // ----------------------------------------------

        if (
            !Number.isInteger(stockNumero) ||
            stockNumero < 0
        ) {
            res.status(400).json({
                mensaje:
                    "El stock debe ser un número entero mayor o igual a 0"
            });
            return;
        }

        // ----------------------------------------------
        // Validar precio de alquiler
        // ----------------------------------------------

        if (
            precioAlquilerNumero !== null &&
            (
                !Number.isFinite(
                    precioAlquilerNumero
                ) ||
                precioAlquilerNumero < 0
            )
        ) {
            res.status(400).json({
                mensaje:
                    "El precio de alquiler debe ser mayor o igual a 0"
            });
            return;
        }

        // ----------------------------------------------
        // Validar costo
        // ----------------------------------------------

        if (
            costoNumero !== null &&
            (
                !Number.isFinite(costoNumero) ||
                costoNumero < 0
            )
        ) {
            res.status(400).json({
                mensaje:
                    "El costo debe ser mayor o igual a 0"
            });
            return;
        }

        const producto = await crearProducto(
            nombre.trim(),
            descripcion,
            precioNumero,
            stockNumero,
            categoria,
            talla,
            color,
            precioAlquilerNumero,
            costoNumero,
            foto_url
        );

        res.status(201).json({
            mensaje:
                "Producto registrado correctamente",
            producto
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al crear producto"
        });
    }
};

// ======================================================
// MODIFICAR PRODUCTO
// ======================================================

export const modificarProducto = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            res.status(400).json({
                mensaje:
                    "El ID debe ser un número"
            });
            return;
        }

        const {
            nombre,
            descripcion = null,
            precio,
            stock,
            categoria = null,
            talla = null,
            color = null,
            precio_alquiler = null,
            costo = null,
            foto_url = null
        } = req.body;

        if (
            typeof nombre !== "string" ||
            nombre.trim() === ""
        ) {
            res.status(400).json({
                mensaje:
                    "El nombre es obligatorio"
            });
            return;
        }

        const precioNumero = Number(precio);
        const stockNumero = Number(stock);

        const precioAlquilerNumero =
            precio_alquiler === null ||
            precio_alquiler === ""
                ? null
                : Number(precio_alquiler);

        const costoNumero =
            costo === null ||
            costo === ""
                ? null
                : Number(costo);

        if (
            !Number.isFinite(precioNumero) ||
            precioNumero < 0
        ) {
            res.status(400).json({
                mensaje:
                    "El precio debe ser un número mayor o igual a 0"
            });
            return;
        }

        if (
            !Number.isInteger(stockNumero) ||
            stockNumero < 0
        ) {
            res.status(400).json({
                mensaje:
                    "El stock debe ser un número entero mayor o igual a 0"
            });
            return;
        }

        if (
            precioAlquilerNumero !== null &&
            (
                !Number.isFinite(
                    precioAlquilerNumero
                ) ||
                precioAlquilerNumero < 0
            )
        ) {
            res.status(400).json({
                mensaje:
                    "El precio de alquiler debe ser mayor o igual a 0"
            });
            return;
        }

        if (
            costoNumero !== null &&
            (
                !Number.isFinite(costoNumero) ||
                costoNumero < 0
            )
        ) {
            res.status(400).json({
                mensaje:
                    "El costo debe ser mayor o igual a 0"
            });
            return;
        }

        const producto =
            await actualizarProducto(
                id,
                nombre.trim(),
                descripcion,
                precioNumero,
                stockNumero,
                categoria,
                talla,
                color,
                precioAlquilerNumero,
                costoNumero,
                foto_url
            );

        if (!producto) {
            res.status(404).json({
                mensaje:
                    "Producto no encontrado"
            });
            return;
        }

        res.json({
            mensaje:
                "Producto actualizado correctamente",
            producto
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al actualizar producto"
        });
    }
};

// ======================================================
// ELIMINAR PRODUCTO
// ======================================================

export const borrarProducto = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            res.status(400).json({
                mensaje:
                    "El ID debe ser un número"
            });
            return;
        }

        const producto =
            await eliminarProducto(id);

        if (!producto) {
            res.status(404).json({
                mensaje:
                    "Producto no encontrado"
            });
            return;
        }

        res.json({
            mensaje:
                "Producto eliminado correctamente",
            producto
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al eliminar producto"
        });
    }
};

// ======================================================
// SUBIR FOTO DEL PRODUCTO
// ======================================================

export const subirFotoProducto = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            res.status(400).json({
                mensaje:
                    "El ID debe ser un número"
            });
            return;
        }

        const productoExistente =
            await obtenerProductoPorId(id);

        if (!productoExistente) {
            res.status(404).json({
                mensaje:
                    "Producto no encontrado"
            });
            return;
        }

        if (!req.file) {
            res.status(400).json({
                mensaje:
                    "Debes seleccionar una imagen"
            });
            return;
        }

        const fotoUrl =
            `/uploads/productos/${req.file.filename}`;

        const producto =
            await actualizarFotoProducto(
                id,
                fotoUrl
            );

        res.json({
            mensaje:
                "Foto del producto actualizada correctamente",
            foto_url: fotoUrl,
            producto
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al subir la foto del producto"
        });
    }
};

// ======================================================
// CATÁLOGO DE PRODUCTOS
// ======================================================

export const listarCatalogo = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            busqueda,
            categoria,
            talla,
            color,
            modalidad
        } = req.query;

        const modalidadesPermitidas = [
            "venta",
            "alquiler",
            "venta_y_alquiler"
        ];

        if (
            modalidad &&
            (
                typeof modalidad !== "string" ||
                !modalidadesPermitidas.includes(
                    modalidad
                )
            )
        ) {
            res.status(400).json({
                mensaje: "Modalidad inválida",
                modalidades_permitidas:
                    modalidadesPermitidas
            });
            return;
        }

        const productos =
            await obtenerCatalogoProductos(
                typeof busqueda === "string"
                    ? busqueda.trim()
                    : undefined,

                typeof categoria === "string"
                    ? categoria.trim()
                    : undefined,

                typeof talla === "string"
                    ? talla.trim()
                    : undefined,

                typeof color === "string"
                    ? color.trim()
                    : undefined,

                typeof modalidad === "string"
                    ? modalidad
                    : undefined
            );

        res.json({
            filtros: {
                busqueda:
                    busqueda || null,

                categoria:
                    categoria || null,

                talla:
                    talla || null,

                color:
                    color || null,

                modalidad:
                    modalidad || null
            },

            cantidad:
                productos.length,

            productos
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al obtener el catálogo"
        });
    }
};