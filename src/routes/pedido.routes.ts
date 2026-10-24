import { Router } from "express";
import {
    obtenerPedidos,
    registrarPedido,
    obtenerPedido
} from "../controllers/pedido.controller";

const router = Router();

router.get("/", obtenerPedidos);
router.get("/:id", obtenerPedido);
router.post("/", registrarPedido);

export default router;