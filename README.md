# Star Wars Movies API (NestJS)

Backend en NestJS para gestionar peliculas con autenticacion JWT, control de roles y sincronizacion con SWAPI.

## Stack

- NestJS
- TypeORM + PostgreSQL
- JWT (`@nestjs/jwt`, `passport-jwt`)
- Swagger
- Jest (tests unitarios)

## Requisitos

- Node.js 20+
- PostgreSQL
- npm

## Configuracion local

1) Instalar dependencias:

```bash
npm install
```

2) Crear archivo `.env` en la raiz del proyecto:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=star_wars_api

JWT_SECRET=un_secreto_largo
JWT_EXPIRES_IN=1d
```

3) Asegurarte de tener creada la DB `star_wars_api`.

Nota: en desarrollo, con `synchronize: true`, TypeORM crea/ajusta tablas automaticamente al levantar la app.

## Levantar el proyecto

```bash
npm run start:dev
```

Servidor local:
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

## Endpoints implementados

### Auth

- `POST /auth/signup` (publico)
- `POST /auth/login` (publico)
- `GET /auth/me` (JWT)

### Movies

- `GET /movies` (`REGULAR` o `ADMIN`)
- `GET /movies/:id` (`REGULAR` o `ADMIN`)
- `POST /movies` (`ADMIN`)
- `PATCH /movies/:id` (`ADMIN`)
- `DELETE /movies/:id` (`ADMIN`)

### SWAPI Sync

- `POST /swapi-sync/movies` (`ADMIN`)

Sincroniza peliculas desde [SWAPI](https://www.swapi.tech/) y devuelve:
- `imported`
- `updated`
- `skipped`

## Flujo recomendado de prueba

1) `POST /auth/signup`
2) `POST /auth/login` y copiar `accessToken`
3) Autorizar en Swagger con `Bearer <token>`
4) Probar `GET /auth/me`
5) Probar endpoints `movies` segun rol
6) Para probar admin, subir rol en DB:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'tu_email@correo.com';
```

## Testing

Ejecutar tests unitarios:

```bash
npm test
```

## Documentacion adicional

- Guia Postman: `docs/postman-endpoints-guide.md`
- Queries SQL de apoyo: `docs/database-queries.md`

## Autor
Juan Ignacio Bellavitis
