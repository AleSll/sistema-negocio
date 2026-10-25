import multer from "multer";
import path from "path";

// ======================================================
// CONFIGURAR ALMACENAMIENTO
// ======================================================

const storage = multer.diskStorage({
    destination: (
        req,
        file,
        cb
    ) => {
        cb(
            null,
            "uploads/productos"
        );
    },

    filename: (
        req,
        file,
        cb
    ) => {
        const extension =
            path.extname(
                file.originalname
            ).toLowerCase();

        const nombreArchivo =
            `producto-${Date.now()}-${Math.round(
                Math.random() * 1E9
            )}${extension}`;

        cb(
            null,
            nombreArchivo
        );
    }
});

// ======================================================
// VALIDAR TIPO DE ARCHIVO
// ======================================================

const filtroImagen = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (
        tiposPermitidos.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
        return;
    }

    cb(
        new Error(
            "Solo se permiten imágenes JPG, PNG o WEBP"
        )
    );
};

// ======================================================
// CONFIGURAR MULTER
// ======================================================

export const uploadProducto = multer({
    storage,

    fileFilter:
        filtroImagen,

    limits: {
        fileSize:
            5 * 1024 * 1024
    }
});