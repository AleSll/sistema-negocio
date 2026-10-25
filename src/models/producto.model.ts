import { pool } from "../config/database";

// ======================================================
// LISTAR PRODUCTOS
// ======================================================

export const obtenerProductos = async () => {
    const resultado = await pool.query(
        `SELECT *
         FROM productos
         ORDER BY id`
    );

    return resultado.rows;
};

// ======================================================
// OBTENER PRODUCTO POR ID
// ======================================================

export const obtenerProductoPorId = async (
    id: string
) => {
    const resultado = await pool.query(
        `SELECT *
         FROM productos
         WHERE id = $1`,
        [id]
    );

    return resultado.rows[0];
};

// ======================================================
// CREAR PRODUCTO
// ======================================================

export const crearProducto = async (
    nombre: string,
    descripcion: string | null,
    precio: number,
    stock: number,
    categoria: string | null,
    talla: string | null,
    color: string | null,
    precio_alquiler: number | null,
    costo: number | null,
    foto_url: string | null
) => {
    const resultado = await pool.query(
        `INSERT INTO productos (
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            talla,
            color,
            precio_alquiler,
            costo,
            foto_url
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10
        )
        RETURNING *`,
        [
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            talla,
            color,
            precio_alquiler,
            costo,
            foto_url
        ]
    );

    return resultado.rows[0];
};

// ======================================================
// ACTUALIZAR PRODUCTO
// ======================================================

export const actualizarProducto = async (
    id: string,
    nombre: string,
    descripcion: string | null,
    precio: number,
    stock: number,
    categoria: string | null,
    talla: string | null,
    color: string | null,
    precio_alquiler: number | null,
    costo: number | null,
    foto_url: string | null
) => {
    const resultado = await pool.query(
        `UPDATE productos
         SET
            nombre = $1,
            descripcion = $2,
            precio = $3,
            stock = $4,
            categoria = $5,
            talla = $6,
            color = $7,
            precio_alquiler = $8,
            costo = $9,
            foto_url = $10
         WHERE id = $11
         RETURNING *`,
        [
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            talla,
            color,
            precio_alquiler,
            costo,
            foto_url,
            id
        ]
    );

    return resultado.rows[0];
};

// ======================================================
// ELIMINAR PRODUCTO
// ======================================================

export const eliminarProducto = async (
    id: string
) => {
    const resultado = await pool.query(
        `DELETE FROM productos
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return resultado.rows[0];
};

// ======================================================
// ACTUALIZAR FOTO DEL PRODUCTO
// ======================================================

export const actualizarFotoProducto = async (
    id: string,
    foto_url: string
) => {
    const resultado = await pool.query(
        `UPDATE productos
         SET foto_url = $1
         WHERE id = $2
         RETURNING *`,
        [foto_url, id]
    );

    return resultado.rows[0];
};

// ======================================================
// OBTENER CATÁLOGO DE PRODUCTOS CON FILTROS
// ======================================================

export const obtenerCatalogoProductos = async (
    busqueda?: string,
    categoria?: string,
    talla?: string,
    color?: string,
    modalidad?: string
) => {
    const condiciones: string[] = [];
    const valores: any[] = [];

    // Búsqueda por nombre o descripción
    if (busqueda) {
        valores.push(`%${busqueda}%`);

        condiciones.push(
            `(nombre ILIKE $${valores.length}
              OR descripcion ILIKE $${valores.length})`
        );
    }

    // Categoría
    if (categoria) {
        valores.push(categoria);

        condiciones.push(
            `categoria ILIKE $${valores.length}`
        );
    }

    // Talla
    if (talla) {
        valores.push(talla);

        condiciones.push(
            `talla ILIKE $${valores.length}`
        );
    }

    // Color
    if (color) {
        valores.push(color);

        condiciones.push(
            `color ILIKE $${valores.length}`
        );
    }

    // Modalidad
    if (modalidad === "alquiler") {
        condiciones.push(
            `precio_alquiler IS NOT NULL`
        );
    }

    if (modalidad === "venta") {
        condiciones.push(
            `precio IS NOT NULL`
        );
    }

    if (modalidad === "venta_y_alquiler") {
        condiciones.push(
            `precio IS NOT NULL
             AND precio_alquiler IS NOT NULL`
        );
    }

    const where =
        condiciones.length > 0
            ? `WHERE ${condiciones.join(" AND ")}`
            : "";

    const resultado = await pool.query(
        `SELECT
            id,
            nombre,
            descripcion,
            categoria,
            talla,
            color,
            precio,
            precio_alquiler,
            stock,
            foto_url,

            CASE
                WHEN stock > 0
                THEN 'Disponible'
                ELSE 'Sin stock'
            END AS disponibilidad,

            CASE
                WHEN precio IS NOT NULL
                     AND precio_alquiler IS NOT NULL
                THEN 'venta_y_alquiler'

                WHEN precio_alquiler IS NOT NULL
                THEN 'alquiler'

                ELSE 'venta'
            END AS modalidad

         FROM productos

         ${where}

         ORDER BY nombre ASC`,
        valores
    );

    return resultado.rows;
};