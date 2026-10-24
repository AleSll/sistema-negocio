import clienteRoutes from "./routes/cliente.routes";
import express from "express";
import { pool } from "./config/database";
import productoRoutes from "./routes/producto.routes";
import pedidoRoutes from "./routes/pedido.routes";
import pagoRoutes from "./routes/pago.routes";
import ventaRoutes from "./routes/venta.routes";
import alquilerRoutes from "./routes/alquiler.routes";
import pagoAlquilerRoutes from "./routes/pagoAlquiler.routes";
const app = express();

const PORT = 3000;

app.use(express.json());

app.use("/api/clientes", clienteRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/pedidos", pagoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/alquileres", alquilerRoutes);
app.use("/api/alquileres", pagoAlquilerRoutes);
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