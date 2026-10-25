import { Router } from "express";

import {
    listarProductos,
    buscarProducto,
    registrarProducto,
    modificarProducto,
    borrarProducto,
    subirFotoProducto,
    listarCatalogo
} from "../controllers/producto.controller";

import {
    uploadProducto
} from "../middlewares/uploadProducto";

const router = Router();

// ======================================================
// LISTAR PRODUCTOS
// ======================================================

router.get(
    "/",
    listarProductos
);

// ======================================================
// CATÁLOGO DE PRODUCTOS
// IMPORTANTE: debe estar antes de /:id
// ======================================================

router.get(
    "/catalogo",
    listarCatalogo
);

// ======================================================
// BUSCAR PRODUCTO POR ID
// ======================================================

router.get(
    "/:id",
    buscarProducto
);

// ======================================================
// REGISTRAR PRODUCTO
// ======================================================

router.post(
    "/",
    registrarProducto
);

// ======================================================
// SUBIR FOTO DE PRODUCTO
// ======================================================

router.post(
    "/:id/foto",
    uploadProducto.single("foto"),
    subirFotoProducto
);

// ======================================================
// MODIFICAR PRODUCTO
// ======================================================

router.put(
    "/:id",
    modificarProducto
);

// ======================================================
// ELIMINAR PRODUCTO
// ======================================================

router.delete(
    "/:id",
    borrarProducto
);

export default router;