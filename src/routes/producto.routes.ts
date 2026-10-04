import { Router } from "express";

import {
    listarProductos,
    buscarProducto,
    registrarProducto,
    modificarProducto,
    borrarProducto
} from "../controllers/producto.controller";

const router = Router();

router.get("/", listarProductos);

router.get("/:id", buscarProducto);

router.post("/", registrarProducto);

router.put("/:id", modificarProducto);

router.delete("/:id", borrarProducto);

export default router;