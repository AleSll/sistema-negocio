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