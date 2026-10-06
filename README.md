# Sistema de Negocio

API REST para la gestión de productos, desarrollada con Node.js, TypeScript, Express y PostgreSQL.

## 📋 Descripción

Este proyecto consiste en una API REST para administrar productos de un negocio.

La API permite realizar operaciones CRUD:

- Crear productos
- Listar productos
- Buscar productos por ID
- Actualizar productos
- Eliminar productos

Además, cuenta con validaciones de datos y manejo de errores HTTP.

## 🚀 Tecnologías utilizadas

- Node.js
- TypeScript
- Express
- PostgreSQL
- pg
- dotenv
- Postman
- Git
- GitHub

## 📁 Estructura del proyecto

```text
sistema-negocio/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── producto.controller.ts
│   ├── models/
│   │   └── producto.model.ts
│   ├── routes/
│   │   └── producto.routes.ts
│   └── app.ts
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md


⚙️ Instalación
1. Clonar el repositorio
git clone https://github.com/AleSll/sistema-negocio.git

2. Entrar al proyecto
cd sistema-negocio

3. Instalar dependencias
npm install

🗄️ Configuración de PostgreSQL
Crear una base de datos llamada:
sistema_negocio

Luego crear la tabla productos:
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

🔐 Variables de entorno
Crear un archivo .env en la raíz del proyecto:
DB_HOST=localhost
DB_PORT=5433
DB_NAME=sistema_negocio
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA

El archivo .env no se incluye en GitHub porque contiene información privada.

▶️ Ejecutar el proyecto
Para iniciar el servidor en modo desarrollo:
npm run dev

El servidor estará disponible en:
http://localhost:3000

🔌 Endpoints
Productos
Método	Endpoint	Descripción
GET	/api/productos	Listar productos
GET	/api/productos/:id	Buscar producto
POST	/api/productos	Crear producto
PUT	/api/productos/:id	Actualizar producto
DELETE	/api/productos/:id	Eliminar producto


📦 Ejemplo de producto
Para crear un producto mediante POST:
{
    "nombre": "Polera negra",
    "descripcion": "Polera de algodón",
    "precio": 85.50,
    "stock": 20
}

✅ Validaciones
La API valida:
- El nombre del producto es obligatorio.
- El precio debe ser mayor o igual a 0.
- El stock debe ser mayor o igual a 0.
- El ID debe ser numérico.
- Se devuelve 404 cuando el producto no existe.
📊 Códigos HTTP utilizados
Código	Significado
200	Operación exitosa
201	Recurso creado
400	Datos incorrectos
404	Recurso no encontrado
500	Error interno del servidor


🧪 Pruebas
Los endpoints fueron probados utilizando Postman.
Se realizaron pruebas de:
- GET
- POST
- PUT
- DELETE
- Validaciones
- Productos inexistentes
- IDs incorrectos
🏗️ Arquitectura
El proyecto utiliza una separación básica por responsabilidades:
Cliente / Postman
       ↓
     Routes
       ↓
   Controllers
       ↓
      Models
       ↓
   PostgreSQL

🎯 Objetivo del proyecto
Este proyecto forma parte del proceso de aprendizaje y desarrollo de habilidades en backend, APIs REST, bases de datos y desarrollo de sistemas para pequeños negocios.
👨‍💻 Autor
AleSll
Proyecto desarrollado como parte de mi formación en Informática.