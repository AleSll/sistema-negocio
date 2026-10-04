import { pool } from "../config/database";

export const obtenerProductos = async () => {
    const resultado = await pool.query(
        "SELECT * FROM productos ORDER BY id"
    );

    return resultado.rows;
};

export const obtenerProductoPorId = async (id: string) => {
    const resultado = await pool.query(
        "SELECT * FROM productos WHERE id = $1",
        [id]
    );

    return resultado.rows[0];
};

export const crearProducto = async (
    nombre: string,
    descripcion: string,
    precio: number,
    stock: number
) => {
    const resultado = await pool.query(
        `INSERT INTO productos
        (nombre, descripcion, precio, stock)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [nombre, descripcion, precio, stock]
    );

    return resultado.rows[0];
};

export const actualizarProducto = async (
    id: string,
    nombre: string,
    descripcion: string,
    precio: number,
    stock: number
) => {
    const resultado = await pool.query(
        `UPDATE productos
        SET nombre = $1,
            descripcion = $2,
            precio = $3,
            stock = $4
        WHERE id = $5
        RETURNING *`,
        [nombre, descripcion, precio, stock, id]
    );

    return resultado.rows[0];
};

export const eliminarProducto = async (id: string) => {
    const resultado = await pool.query(
        `DELETE FROM productos
        WHERE id = $1
        RETURNING *`,
        [id]
    );

    return resultado.rows[0];
};