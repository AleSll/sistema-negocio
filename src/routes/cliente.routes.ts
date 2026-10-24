import { Router } from "express";

import {
    obtenerClientes,
    obtenerCliente,
    registrarCliente
} from "../controllers/cliente.controller";

const router = Router();

router.get("/", obtenerClientes);
router.get("/:id", obtenerCliente);
router.post("/", registrarCliente);

export default router;