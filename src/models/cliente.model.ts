import { pool } from "../config/database";

export const listarClientes = async () => {
    const resultado = await pool.query(
        "SELECT * FROM clientes ORDER BY id DESC"
    );

    return resultado.rows;
};

export const buscarClientePorId = async (id: string) => {
    const resultado = await pool.query(
        "SELECT * FROM clientes WHERE id = $1",
        [id]
    );

    return resultado.rows[0];
};

export const crearCliente = async (
    nombre: string,
    telefono: string | null
) => {
    const resultado = await pool.query(
        `INSERT INTO clientes (nombre, telefono)
         VALUES ($1, $2)
         RETURNING *`,
        [nombre, telefono]
    );

    return resultado.rows[0];
};