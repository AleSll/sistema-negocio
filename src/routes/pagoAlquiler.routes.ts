import { Router } from "express";
import {
    crearPagoAlquiler,
    obtenerPagosAlquiler,
    resumenFinancieroAlquiler
} from "../controllers/pagoAlquiler.controller";

const router = Router();

// Registrar un pago o movimiento de garantía
router.post("/:id/pagos", crearPagoAlquiler);

// Consultar los movimientos de un alquiler
router.get("/:id/pagos", obtenerPagosAlquiler);

// Consultar el resumen financiero del alquiler
router.get("/:id/resumen", resumenFinancieroAlquiler);

export default router;