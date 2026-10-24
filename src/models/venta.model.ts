import { pool } from "../config/database";

export const listarVentas = async () => {
    const resultado = await pool.query(`
        SELECT
            v.id,
            v.cliente_id,
            c.nombre AS cliente_nombre,
            v.producto_id,
            p.nombre AS producto_nombre,
            v.cantidad,
            v.precio_unitario,
            v.costo_unitario,
            v.cantidad * v.precio_unitario AS total_venta,
            v.cantidad * (
                v.precio_unitario - v.costo_unitario
            ) AS ganancia,
            v.fecha_venta,
            v.observacion
        FROM ventas v
        LEFT JOIN clientes c ON c.id = v.cliente_id
        INNER JOIN productos p ON p.id = v.producto_id
        ORDER BY v.id DESC
    `);

    return resultado.rows;
};

export const registrarVenta = async (
    cliente_id: number | null,
    producto_id: number,
    cantidad: number,
    precio_unitario: number,
    costo_unitario: number,
    observacion: string | null
) => {
    const resultado = await pool.query(
        `INSERT INTO ventas (
            cliente_id,
            producto_id,
            cantidad,
            precio_unitario,
            costo_unitario,
            observacion
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            cliente_id,
            producto_id,
            cantidad,
            precio_unitario,
            costo_unitario,
            observacion
        ]
    );

    return resultado.rows[0];
};
export const registrarVentaConStock = async (
    cliente_id: number | null,
    producto_id: number,
    cantidad: number,
    precio_unitario: number,
    costo_unitario: number,
    observacion: string | null
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Bloquear el producto mientras se procesa la venta.
        const resultadoProducto = await client.query(
            `SELECT id, stock
             FROM productos
             WHERE id = $1
             FOR UPDATE`,
            [producto_id]
        );

        if (resultadoProducto.rowCount === 0) {
            throw new Error("PRODUCTO_NO_ENCONTRADO");
        }

        const stockActual = Number(
            resultadoProducto.rows[0].stock
        );

        if (stockActual < cantidad) {
            throw new Error("STOCK_INSUFICIENTE");
        }

        // Registrar la venta.
        const resultadoVenta = await client.query(
            `INSERT INTO ventas (
                cliente_id,
                producto_id,
                cantidad,
                precio_unitario,
                costo_unitario,
                observacion
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                cliente_id,
                producto_id,
                cantidad,
                precio_unitario,
                costo_unitario,
                observacion
            ]
        );

        // Descontar las unidades vendidas.
        await client.query(
            `UPDATE productos
             SET stock = stock - $1
             WHERE id = $2`,
            [cantidad, producto_id]
        );

        await client.query("COMMIT");

        return resultadoVenta.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};