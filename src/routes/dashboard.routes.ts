import { Router } from "express";

import {
    obtenerResumen,
    obtenerAlquileresPendientes
} from "../controllers/dashboard.controller";

const router = Router();

// Resumen general del negocio
router.get("/resumen", obtenerResumen);

// Alquileres activos y sus saldos
router.get(
    "/alquileres-pendientes",
    obtenerAlquileresPendientes
);

export default router;