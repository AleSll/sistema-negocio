import { Router } from "express";
import {
    registrarPagoPedido,
    listarPagosPedido
} from "../controllers/pago.controller";

const router = Router();

router.post("/:id/pagos", registrarPagoPedido);
router.get("/:id/pagos", listarPagosPedido);

export default router;