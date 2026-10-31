# PagaYA

Billetera digital (monedero de pagos) construida con un backend Node.js/Express y un frontend React.

## Tecnologías

| Parte     | Stack                                                              |
| --------- | ------------------------------------------------------------------ |
| Backend   | Node.js · Express 5 · MongoDB (Mongoose) · SQL Server (mssql) · JWT |
| Frontend  | React 19 · Vite 8 · React Router 7                                 |

## Requisitos previos

- **Node.js** 20.19 o superior (probado con v24).
- **npm** (viene con Node).
- **MongoDB Atlas**: cuenta con un cluster en la nube (las credenciales ya están en `backend/.env`).
- **SQL Server**: una instancia local corriendo en `localhost:1433`. El backend **no arranca** si no puede conectarse a SQL Server (lo exige `src/server.js`).

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/Alexisrock888/PagaYA.git
cd PagaYA
```

### 1. Backend (API — puerto 5000)

```bash
cd backend
npm install
npm run dev        # desarrollo (nodemon)
# npm start        # producción (node src/server.js)
```

Configuración en `backend/.env` (ya viene incluido un archivo de ejemplo `backend/.env.example`).

### 2. Frontend (React — puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173** en el navegador.

## Cómo se ejecuta cada parte

1. Levanta primero el **backend** (debe conectar con MongoDB Atlas y SQL Server).
2. Luego levanta el **frontend** (se comunica con la API en `http://localhost:5000/api`, valor definido en `frontend/src/services/api.js`).
3. Usa la app: registra un usuario o inicia sesión y verás el saldo de tu billetera.

## Scripts útiles

| Comando             | Carpeta   | Descripción                                    |
| ------------------- | --------- | ---------------------------------------------- |
| `npm run dev`       | backend   | Inicia la API con recarga automática           |
| `npm start`         | backend   | Inicia la API en modo producción               |
| `node diagnostico-mongodb.js` | backend | Lista usuarios, billeteras y transacciones |
| `node migrar-mongodb-sql.js`  | backend | Migra datos de MongoDB a SQL Server      |
| `npm run dev`       | frontend  | Inicia el servidor de desarrollo de Vite       |
| `npm run build`     | frontend  | Genera el build de producción                  |
| `npm run lint`      | frontend  | Ejecuta el linter (oxlint)                     |

## Notas

- El archivo `backend/.env` contiene credenciales de conexión. Si vas a usar el proyecto en producción, **rota las claves** (MongoDB, `JWT_SECRET` y SQL Server) y usa `backend/.env.example` como plantilla.
- `server.js` requiere conexión exitosa a **MongoDB y SQL Server** para iniciar. Si solo quieres probar auth/wallet (que usan MongoDB), haz opcional la conexión a SQL Server en `src/config/sqlserver.js`.
