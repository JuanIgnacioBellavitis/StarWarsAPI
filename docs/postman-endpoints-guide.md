# Postman guide - Auth and Movies endpoints

Esta guia sirve para probar los endpoints ya implementados.

## 1) Requisitos previos

- App corriendo: `npm run start:dev`
- Base de datos conectada (segun tu `.env`)
- URL base local: `http://localhost:3000`

## 2) Endpoints disponibles hoy

### Auth

- `POST /auth/signup` (publico)
- `POST /auth/login` (publico)
- `GET /auth/me` (requiere JWT)

### Movies

- `GET /movies` (REGULAR o ADMIN)
- `GET /movies/:id` (REGULAR o ADMIN)
- `POST /movies` (solo ADMIN)
- `PATCH /movies/:id` (solo ADMIN)
- `DELETE /movies/:id` (solo ADMIN)

### SWAPI Sync

- `POST /swapi-sync/movies` (solo ADMIN)

## 3) Paso a paso en Postman

## Paso A - Crear usuario

Request:
- Method: `POST`
- URL: `http://localhost:3000/auth/signup`
- Body (JSON):

```json
{
  "email": "regular@demo.com",
  "password": "StrongPass123"
}
```

Respuesta esperada:
- `201 Created`
- Devuelve `id`, `email`, `role`, `createdAt`

## Paso B - Login

Request:
- Method: `POST`
- URL: `http://localhost:3000/auth/login`
- Body (JSON):

```json
{
  "email": "regular@demo.com",
  "password": "StrongPass123"
}
```

Respuesta esperada:
- `200 OK`
- Devuelve:

```json
{
  "accessToken": "..."
}
```

Guarda este token en una variable de Postman, por ejemplo `accessToken`.

## Paso C - Usar Authorization Bearer Token

En cada request protegida:
- Tab `Authorization`
- Type: `Bearer Token`
- Token: `{{accessToken}}` (o pegado manualmente)

## Paso D - Ver usuario autenticado

Request:
- Method: `GET`
- URL: `http://localhost:3000/auth/me`
- Authorization: Bearer token

Respuesta esperada:
- `200 OK`
- Devuelve `id`, `email`, `role`

## 4) Pruebas con rol REGULAR

Con usuario regular deberia pasar:
- `GET /movies`
- `GET /movies/:id` (si existe)

Con usuario regular deberia fallar (403):
- `POST /movies`
- `PATCH /movies/:id`
- `DELETE /movies/:id`

## 5) Subir usuario a ADMIN para probar CRUD completo

Ejecuta esta query en PostgreSQL:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'regular@demo.com';
```

Luego vuelve a hacer login para obtener token nuevo.

## 6) Pruebas con rol ADMIN

### Crear pelicula

- Method: `POST`
- URL: `http://localhost:3000/movies`
- Body:

```json
{
  "title": "A New Hope",
  "releaseYear": 1977,
  "director": "George Lucas"
}
```

### Listar peliculas

- Method: `GET`
- URL: `http://localhost:3000/movies`

### Obtener detalle

- Method: `GET`
- URL: `http://localhost:3000/movies/:id`

### Actualizar pelicula

- Method: `PATCH`
- URL: `http://localhost:3000/movies/:id`
- Body:

```json
{
  "director": "G. Lucas"
}
```

### Eliminar pelicula

- Method: `DELETE`
- URL: `http://localhost:3000/movies/:id`

### Sincronizar peliculas desde SWAPI

- Method: `POST`
- URL: `http://localhost:3000/swapi-sync/movies`
- Body: vacio

Respuesta esperada:
- `200 OK`
- Ejemplo:

```json
{
  "imported": 6,
  "updated": 0,
  "skipped": 0
}
```

## 7) Errores comunes

- `401 Unauthorized`: token ausente o invalido.
- `403 Forbidden`: token valido pero rol insuficiente.
- `404 Not Found`: recurso no encontrado (ej. `movie id` inexistente).
- `400 Bad Request`: body invalido por validaciones DTO.
