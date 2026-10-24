import { Router } from "express";
import {
    listar,
    obtenerPorId,
    crear,
    actualizarEstado,
    consultarDisponibilidad
} from "../controllers/alquiler.controller";

const router = Router();

// Listar todos los alquileres
router.get("/", listar);

// Consultar disponibilidad por fechas
router.get("/disponibilidad", consultarDisponibilidad);

// Obtener un alquiler por ID
router.get("/:id", obtenerPorId);

// Registrar un alquiler
router.post("/", crear);

// Actualizar el estado de un alquiler
router.patch("/:id/estado", actualizarEstado);

export default router;