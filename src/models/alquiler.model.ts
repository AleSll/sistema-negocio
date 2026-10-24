import { pool } from "../config/database";

export const listarAlquileres = async () => {
    const resultado = await pool.query(`
        SELECT
            a.*,
            c.nombre AS cliente_nombre,
            p.nombre AS producto_nombre
        FROM alquileres a
        INNER JOIN clientes c ON c.id = a.cliente_id
        INNER JOIN productos p ON p.id = a.producto_id
        ORDER BY a.id DESC
    `);

    return resultado.rows;
};

export const obtenerAlquilerPorId = async (id: number) => {
    const resultado = await pool.query(
        `SELECT
            a.*,
            c.nombre AS cliente_nombre,
            p.nombre AS producto_nombre
         FROM alquileres a
         INNER JOIN clientes c ON c.id = a.cliente_id
         INNER JOIN productos p ON p.id = a.producto_id
         WHERE a.id = $1`,
        [id]
    );

    return resultado.rows[0];
};

export const registrarAlquiler = async (
    cliente_id: number,
    producto_id: number,
    fecha_alquiler: string,
    fecha_devolucion: string,
    precio_alquiler: number,
    deposito_garantia: number,
    observacion: string | null,
    cantidad: number = 1
) => {
    const resultado = await pool.query(
        `INSERT INTO alquileres (
            cliente_id,
            producto_id,
            fecha_alquiler,
            fecha_devolucion,
            precio_alquiler,
            deposito_garantia,
            observacion,
            cantidad
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
            cliente_id,
            producto_id,
            fecha_alquiler,
            fecha_devolucion,
            precio_alquiler,
            deposito_garantia,
            observacion,
            cantidad
        ]
    );

    return resultado.rows[0];
};
export const actualizarEstadoAlquiler = async (
    id: number,
    estado: string
) => {
    const resultado = await pool.query(
        `UPDATE alquileres
         SET estado = $1
         WHERE id = $2
         RETURNING *`,
        [estado, id]
    );

    return resultado.rows[0];
};