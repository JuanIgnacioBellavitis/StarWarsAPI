# API Endpoints

Base URL: `http://localhost:3000`

Swagger interactivo: `http://localhost:3000/docs`

---

## Autenticacion

Los endpoints protegidos requieren un header:

```
Authorization: Bearer <accessToken>
```

En Postman: tab `Authorization` → Type: `Bearer Token` → pegar el token (o usar `{{accessToken}}`).

---

## Auth

### POST /auth/signup

Registra un nuevo usuario. Rol asignado por defecto: `REGULAR`.

**Acceso:** Publico

**Body:**
```json
{
  "email": "usuario@correo.com",
  "password": "StrongPass123"
}
```

**Respuesta 201:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "usuario@correo.com",
  "role": "REGULAR",
  "createdAt": "2026-04-06T12:00:00.000Z"
}
```

**Errores:**
- `400` — email invalido o password menor a 8 caracteres
- `409` — email ya registrado

---

### POST /auth/login

Autentica un usuario y devuelve un JWT.

**Acceso:** Publico

**Body:**
```json
{
  "email": "usuario@correo.com",
  "password": "StrongPass123"
}
```

**Respuesta 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Guarda este token en una variable de Postman, por ejemplo `accessToken`.

**Errores:**
- `401` — credenciales invalidas

---

### GET /auth/me

Devuelve los datos del usuario autenticado.

**Acceso:** Cualquier rol con JWT valido

**Respuesta 200:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "usuario@correo.com",
  "role": "REGULAR"
}
```

**Errores:**
- `401` — token ausente o invalido

---

## Movies

### GET /movies

Lista todas las peliculas almacenadas, ordenadas por fecha de creacion descendente.

**Acceso:** `REGULAR` o `ADMIN`

**Respuesta 200:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "swapiUid": "1",
    "episodeId": 4,
    "title": "A New Hope",
    "releaseYear": 1977,
    "director": "George Lucas",
    "producer": "Gary Kurtz, Rick McCallum",
    "openingCrawl": "It is a period of civil war...",
    "characters": ["Luke Skywalker", "C-3PO", "R2-D2"],
    "planets": ["Tatooine", "Alderaan"],
    "species": ["Human", "Droid"],
    "starships": ["CR90 corvette", "Death Star"],
    "vehicles": ["Sand Crawler", "T-16 skyhopper"],
    "createdAt": "2026-04-06T12:00:00.000Z",
    "updatedAt": "2026-04-06T12:00:00.000Z"
  }
]
```

**Errores:**
- `401` — token ausente o invalido
- `403` — rol insuficiente

---

### GET /movies/:id

Devuelve el detalle de una pelicula. Acepta UUID o numero de episodio SWAPI como identificador.

**Acceso:** `REGULAR`

**Parametros:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `string` | UUID de la pelicula **o** numero de episodio SWAPI (e.g., `1` para A New Hope) |

**Ejemplos:**
```
GET /movies/1
GET /movies/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Respuesta 200:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "swapiUid": "1",
  "episodeId": 4,
  "title": "A New Hope",
  "releaseYear": 1977,
  "director": "George Lucas",
  "producer": "Gary Kurtz, Rick McCallum",
  "openingCrawl": "It is a period of civil war...",
  "characters": ["Luke Skywalker", "C-3PO", "R2-D2"],
  "planets": ["Tatooine", "Alderaan"],
  "species": ["Human", "Droid"],
  "starships": ["CR90 corvette", "Death Star"],
  "vehicles": ["Sand Crawler", "T-16 skyhopper"],
  "createdAt": "2026-04-06T12:00:00.000Z",
  "updatedAt": "2026-04-06T12:00:00.000Z"
}
```

**Errores:**
- `401` — token ausente o invalido
- `403` — rol insuficiente (solo REGULAR puede acceder)
- `404` — pelicula no encontrada

---

### POST /movies

Crea una nueva pelicula manualmente.

**Acceso:** `ADMIN`

**Body:**
```json
{
  "title": "The Acolyte",
  "releaseYear": 2024,
  "director": "Leslye Headland"
}
```

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `title` | `string` | Si | minimo 1 caracter |
| `releaseYear` | `number` | Si | entero entre 1900 y 2100 |
| `director` | `string` | Si | minimo 1 caracter |

**Respuesta 201:**
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "swapiUid": null,
  "episodeId": null,
  "title": "The Acolyte",
  "releaseYear": 2024,
  "director": "Leslye Headland",
  "producer": null,
  "openingCrawl": null,
  "characters": null,
  "planets": null,
  "species": null,
  "starships": null,
  "vehicles": null,
  "createdAt": "2026-04-06T12:00:00.000Z",
  "updatedAt": "2026-04-06T12:00:00.000Z"
}
```

**Errores:**
- `400` — campos invalidos o faltantes
- `401` — token ausente o invalido
- `403` — rol insuficiente (solo ADMIN)

---

### PATCH /movies/:id

Actualiza parcialmente una pelicula. Solo se actualizan los campos enviados.

**Acceso:** `ADMIN`

**Parametros:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `string` | UUID de la pelicula |

**Body (todos los campos opcionales):**
```json
{
  "title": "A New Hope (Remastered)",
  "releaseYear": 1977,
  "director": "George Lucas"
}
```

**Respuesta 200:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "swapiUid": "1",
  "episodeId": 4,
  "title": "A New Hope (Remastered)",
  "releaseYear": 1977,
  "director": "George Lucas",
  "producer": "Gary Kurtz, Rick McCallum",
  "openingCrawl": "It is a period of civil war...",
  "characters": null,
  "planets": null,
  "species": null,
  "starships": null,
  "vehicles": null,
  "createdAt": "2026-04-06T12:00:00.000Z",
  "updatedAt": "2026-04-06T13:00:00.000Z"
}
```

**Errores:**
- `400` — campos con formato invalido
- `401` — token ausente o invalido
- `403` — rol insuficiente (solo ADMIN)
- `404` — pelicula no encontrada

---

### DELETE /movies/:id

Elimina una pelicula permanentemente.

**Acceso:** `ADMIN`

**Parametros:**
| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `string` | UUID de la pelicula |

**Respuesta 200:**
```json
{
  "deleted": true
}
```

**Errores:**
- `401` — token ausente o invalido
- `403` — rol insuficiente (solo ADMIN)
- `404` — pelicula no encontrada

---

## SWAPI Sync

### POST /swapi-sync/movies

Sincroniza las 6 peliculas de la saga original desde [SWAPI](https://www.swapi.tech/) hacia la base de datos local. Incluye personajes, planetas, especies, naves y vehiculos relacionados.

- Si la pelicula no existe, la importa.
- Si ya existe, la actualiza con los datos mas recientes.
- Si los datos son identicos, la omite.

**Acceso:** `ADMIN`

**Respuesta 200:**
```json
{
  "imported": 6,
  "updated": 0,
  "skipped": 0
}
```

**Errores:**
- `401` — token ausente o invalido
- `403` — rol insuficiente (solo ADMIN)

---

## Roles

| Rol | Descripcion |
|-----|-------------|
| `REGULAR` | Usuario estandar. Puede listar y ver detalle de peliculas. |
| `ADMIN` | Administrador. Puede crear, editar, eliminar peliculas y ejecutar la sincronizacion con SWAPI. |

Por defecto, todos los usuarios registrados reciben el rol `REGULAR`. Para promover un usuario a `ADMIN`:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'tu_email@correo.com';
```

Luego volver a hacer login para obtener un token nuevo con el rol actualizado.

---

## Errores comunes

| Codigo | Significado |
|--------|-------------|
| `400` | Body invalido segun validaciones DTO |
| `401` | Token ausente o invalido |
| `403` | Token valido pero rol insuficiente |
| `404` | Recurso no encontrado |
| `409` | Conflicto (e.g., email ya registrado) |
