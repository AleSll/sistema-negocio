import { Request, Response } from "express";

import {
    obtenerResumenDashboard,
    listarAlquileresPendientes
} from "../models/dashboard.model";

// ======================================================
// RESUMEN GENERAL DEL DASHBOARD
// ======================================================

export const obtenerResumen = async (
    req: Request,
    res: Response
) => {
    try {
        const resumen =
            await obtenerResumenDashboard();

        res.json(resumen);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al obtener el resumen del negocio"
        });
    }
};

// ======================================================
// ALQUILERES ACTIVOS / PENDIENTES
// ======================================================

export const obtenerAlquileresPendientes = async (
    req: Request,
    res: Response
) => {
    try {
        const alquileres =
            await listarAlquileresPendientes();

        res.json({
            cantidad:
                alquileres.length,

            alquileres
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje:
                "Error al consultar los alquileres pendientes"
        });
    }
};