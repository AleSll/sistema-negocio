import express from "express";
import { pool } from "./config/database";
import productoRoutes from "./routes/producto.routes";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensaje: "API del Sistema de Negocio funcionando"
    });
});

app.use("/api/productos", productoRoutes);

pool.query("SELECT NOW()")
    .then(() => {
        console.log("Conexión con PostgreSQL exitosa");
    })
    .catch((error) => {
        console.error("Error de conexión:", error);
    });

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});