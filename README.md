<div align="center">

# 🛠️ Reservas Institucionales — Documentación Técnica

### Rama `dev` · Desarrollo de frontend, backend y base de datos

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-HS256-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

> [!NOTE]
> Este README corresponde a la **rama de desarrollo (`dev`)**. Documenta la arquitectura técnica, el modelo de datos, los endpoints, la seguridad y **cómo ejecutar el proyecto en modo desarrollo**. Para el despliegue con Docker consulta la rama [`ops`](../../tree/ops); para el manual de usuario, la rama [`main`](../../tree/main).

---

## 📑 Contenido

- [Arquitectura](#-arquitectura)
- [Tecnologías y librerías](#-tecnologías-y-librerías)
- [Estructura de carpetas](#-estructura-de-carpetas)
- [Diseño de base de datos](#-diseño-de-base-de-datos)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Autenticación JWT y roles](#-autenticación-jwt-y-roles)
- [Reglas de negocio y validación](#-reglas-de-negocio-y-validación)
- [Ejecución en modo desarrollo](#-ejecución-en-modo-desarrollo)
- [Variables de entorno](#-variables-de-entorno)

---

## 🏗️ Arquitectura

Aplicación de **tres capas** desacopladas: un frontend que consume una API REST, un backend que aplica la lógica de negocio, y una base de datos relacional.

```mermaid
flowchart LR
    subgraph FE["🖥️ Frontend"]
        H["HTML · CSS · JS<br/>Three.js (WebGL)"]
    end
    subgraph BE["⚙️ Backend — FastAPI"]
        R["Routers /api/v1"]
        S["Schemas (Pydantic)"]
        C["CRUD + reglas de negocio"]
        A["Auth JWT"]
        M["Models (ORM)"]
        R --> S --> C --> M
        A -.protege.-> R
    end
    DB[("🗄️ PostgreSQL")]
    H -->|fetch · JWT| R
    M -->|SQLAlchemy| DB

    style FE fill:#1e293b,stroke:#6366f1,color:#fff
    style BE fill:#1e293b,stroke:#009688,color:#fff
    style DB fill:#1e293b,stroke:#4169E1,color:#fff
```

**Backend (modular):** cada recurso (`usuarios`, `espacios`, `reservas`, `auth`) tiene su router, su esquema Pydantic y su capa CRUD. Las reglas de negocio viven en `app/crud/reserva.py`.

**Frontend (vanilla):** sin frameworks pesados. Una capa `api.js` centraliza las llamadas autenticadas; `auth.js` gestiona el login/registro; `dashboard.js` controla el panel con vistas por rol.

---

## 🧱 Tecnologías y librerías

| Librería | Versión | Uso |
|---|---|---|
| `fastapi` | 0.111.0 | Framework web / API REST |
| `uvicorn` | 0.29.0 | Servidor ASGI |
| `sqlalchemy` | ≥ 2.0.36 | ORM |
| `psycopg2-binary` | ≥ 2.9.9 | Driver PostgreSQL |
| `python-jose[cryptography]` | 3.3.0 | Firma/validación de JWT |
| `passlib[bcrypt]` · `bcrypt` | 1.7.4 / 4.0.1 | Hash de contraseñas |
| `pydantic[email]` | 2.7.1 | Validación de datos |
| `python-multipart` | 0.0.9 | Formularios (login) |
| `python-dotenv` | 1.0.1 | Variables de entorno |

**Frontend:** HTML5, CSS3, JavaScript (ES6+) y [Three.js](https://threejs.org/) r128 para el fondo animado con shaders WebGL.

---

## 📂 Estructura de carpetas

```
app/                         # Backend
├── api/                     #   Routers (endpoints)
│   ├── auth.py              #     /auth  → login, register
│   ├── usuarios.py          #     /usuarios  (CRUD admin)
│   ├── espacios.py          #     /espacios  (CRUD)
│   └── reservas.py          #     /reservas  (CRUD + estado)
├── models/                  #   Entidades SQLAlchemy
│   ├── usuario.py · espacio.py · reserva.py
├── schemas/                 #   Esquemas Pydantic (Create/Update/Response)
├── crud/                    #   Acceso a datos + reglas de negocio
│   ├── usuario.py · espacio.py · reserva.py
├── auth/
│   └── jwt.py               #   Creación y verificación de tokens
├── db.py                    #   Engine, sesión y Base
└── main.py                  #   App, routers, CORS

frontend/                    # Frontend
├── index.html · register.html · dashboard.html
├── config.js · api.js · auth.js · dashboard.js
├── canvas-bg.js             #   Fondo WebGL (shaders)
├── style.css · dashboard.css
└── three.min.js

init_db.py                   # Crea tablas + datos semilla (admin, usuario, espacios)
requirements.txt
```

---

## 🗃️ Diseño de base de datos

```mermaid
erDiagram
    USUARIOS ||--o{ RESERVAS : realiza
    ESPACIOS ||--o{ RESERVAS : recibe

    USUARIOS {
        int    id_usuario PK
        string nombre
        string correo UK
        string contrasena "hash bcrypt"
        string rol "admin | usuario"
    }
    ESPACIOS {
        int    id_espacio PK
        string nombre
        string ubicacion
        int    capacidad
        string estado
    }
    RESERVAS {
        int    id_reserva PK
        int    id_usuario FK
        int    id_espacio FK
        date   fecha
        time   hora_inicio
        time   hora_fin
        int    cantidad_asistentes
        string estado "esperando | aprobada | rechazada"
    }
```

| Tabla | Campo | Tipo | Restricción |
|---|---|---|---|
| **usuarios** | `id_usuario` | INTEGER | PK, autoincremental |
| | `correo` | TEXT | NOT NULL, **UNIQUE** |
| | `contrasena` | TEXT | NOT NULL (hash bcrypt) |
| | `rol` | TEXT | `admin` / `usuario` |
| **espacios** | `id_espacio` | INTEGER | PK |
| | `estado` | TEXT | `activo` / `inactivo` / `en mantenimiento` / `no disponible` |
| **reservas** | `id_reserva` | INTEGER | PK |
| | `id_usuario` / `id_espacio` | INTEGER | FK |
| | `estado` | TEXT | default `esperando` |

---

## 🔌 Endpoints de la API

Prefijo: **`/api/v1`** · Documentación interactiva en **`/docs`** (Swagger) y **`/redoc`**.

#### `/auth`
| Método | Ruta | Descripción | Acceso |
|:---:|---|---|:---:|
| POST | `/auth/register` | Registrar usuario | Público |
| POST | `/auth/login` | Login → JWT | Público |

#### `/usuarios`
| Método | Ruta | Descripción | Acceso |
|:---:|---|---|:---:|
| POST | `/usuarios/` | Crear usuario (con rol) | Admin |
| GET | `/usuarios/` | Listar | Admin |
| GET | `/usuarios/{id}` | Detalle | Admin |
| PUT | `/usuarios/{id}` | Actualizar | Admin |
| DELETE | `/usuarios/{id}` | Eliminar | Admin |

#### `/espacios`
| Método | Ruta | Descripción | Acceso |
|:---:|---|---|:---:|
| POST | `/espacios/` | Crear | Admin |
| GET | `/espacios/` · `/{id}` | Listar / detalle | Autenticado |
| PUT | `/espacios/{id}` | Actualizar | Admin |
| DELETE | `/espacios/{id}` | Eliminar | Admin |

#### `/reservas`
| Método | Ruta | Descripción | Acceso |
|:---:|---|---|:---:|
| POST | `/reservas/` | Crear (valida reglas) | Autenticado |
| GET | `/reservas/` | Listar (admin: todas · usuario: propias) | Autenticado |
| GET | `/reservas/{id}` | Detalle | Autenticado |
| PUT | `/reservas/{id}` | Editar (revalida reglas) | Admin |
| PUT | `/reservas/{id}/estado` | Aprobar / rechazar | Admin |
| DELETE | `/reservas/{id}` | Cancelar | Dueño / Admin |

---

## 🔐 Autenticación JWT y roles

```
1. POST /auth/login  →  verifica correo + contraseña (bcrypt)
2. Backend firma un JWT (HS256) con payload { sub, rol, id, exp }
3. El cliente guarda el token y lo envía en cada petición:
   Authorization: Bearer <token>
4. Dependencias FastAPI validan el token en cada endpoint protegido
```

| Dependencia | Archivo | Función |
|---|---|---|
| `get_current_user` | `app/auth/jwt.py` | Valida el token y devuelve el usuario |
| `require_admin` | `app/auth/jwt.py` | Exige rol `admin` |

| Rol | Permisos |
|---|---|
| `usuario` | Ver espacios · crear/ver/cancelar **sus** reservas |
| `admin` | Todo lo anterior + gestionar espacios, usuarios y aprobar/rechazar reservas |

---

## 📐 Reglas de negocio y validación

Validadas en `app/crud/reserva.py` (`validar_reglas`) **antes** de crear o editar una reserva. Al **editar** se excluye la propia reserva del chequeo de solapamiento.

| # | Regla |
|:---:|---|
| 1 | Solo usuarios autenticados crean reservas |
| 2 | Solo `admin` aprueba/rechaza |
| 3 | Sin solapamiento de espacio en la misma fecha/franja |
| 4 | Anticipación mínima de **24 h** |
| 5 | Horario: Lun–Vie 7:00–20:00 · Sáb 8:00–12:00 · Dom cerrado |
| 6 | `hora_inicio` < `hora_fin` |
| 7 | No se reservan espacios inactivos / en mantenimiento / no disponibles |
| 8 | Asistentes ≤ capacidad del espacio |
| 9 | Estado inicial `esperando`; solo `admin` lo cambia |

Cada incumplimiento devuelve un `HTTPException` con un mensaje claro y el código apropiado (400/403/404).

---

## ▶️ Ejecución en modo desarrollo

> Requiere **Python 3.10+** y **PostgreSQL** en ejecución.

```bash
# 1. Clonar y entrar a la rama dev
git clone https://github.com/Miguel-cast/Laboratorio-4.git
cd Laboratorio-4
git checkout dev

# 2. Entorno virtual
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / WSL:
source venv/bin/activate

# 3. Dependencias
pip install -r requirements.txt

# 4. Variables de entorno
cp .env.example .env
# En .env, para desarrollo local usa  @localhost:5432  en DATABASE_URL

# 5. Crear la base de datos en PostgreSQL
#   psql -U postgres -c "CREATE DATABASE reservas_db;"

# 6. Crear tablas + datos semilla (admin, usuario y espacios de ejemplo)
python init_db.py

# 7. Levantar el servidor de desarrollo
uvicorn app.main:app --reload
```

| URL | Descripción |
|---|---|
| `http://localhost:8000` | API base |
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc |

El **frontend** son archivos estáticos: abre `frontend/index.html` en el navegador (o sírvelo con `python -m http.server` dentro de `frontend/`). Apunta al backend mediante `frontend/config.js`.

**Credenciales semilla:** `admin@correo.com / admin123` · `usuario@correo.com / usuario123`

---

## ⚙️ Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://postgres:admin123@localhost:5432/reservas_db` |
| `SECRET_KEY` | Clave para firmar el JWT | `clave_secreta_segura` |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vigencia del token | `60` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NOMBRE` | Admin inicial (seed) | `admin@correo.com` / `admin123` / `Administrador` |

---

<div align="center">
<sub>Rama <code>dev</code> · Documentación técnica · Aplicaciones y Servicios Web — Tecnología en Desarrollo de Software</sub>
</div>
