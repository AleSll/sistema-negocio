import { Router } from "express";
import {
    obtenerVentas,
    crearVenta
} from "../controllers/venta.controller";

const router = Router();

router.get("/", obtenerVentas);
router.post("/", crearVenta);

export default router;