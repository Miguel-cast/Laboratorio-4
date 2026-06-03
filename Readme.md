# README — Rama dev · Documentación Técnica

## Laboratorio 4 — Gestión de Reservas de Espacios Institucionales

**Asignatura:** Aplicaciones y Servicios Web  
**Programa:** Tecnología en Desarrollo de Software  
**Laboratorio:** DevOps  
**Código de guía:** 004  

---

## Integrantes del equipo

| Nombre | Rol |
|--------|-----|
|  Miguel Castaño | Back-end    |
|  Juan Cardona  |  Fronat-end   |
|        |     |

---

## 1. Arquitectura del sistema

El sistema sigue una arquitectura de tres capas separadas en contenedores independientes:

```
┌─────────────┐        ┌─────────────────┐        ┌──────────────┐
│   Frontend  │ ──────▶│     Backend     │ ──────▶│  PostgreSQL  │
│  (Puerto    │  HTTP  │   FastAPI +     │  ORM   │  Base de     │
│   3000)     │  REST  │   Uvicorn       │  SQL   │  Datos       │
│             │        │  (Puerto 8000)  │        │  (Puerto     │
│             │        │                 │        │   5432)      │
└─────────────┘        └─────────────────┘        └──────────────┘
```

La comunicación entre frontend y backend se realiza mediante una API REST con autenticación JWT.
El backend aplica todas las reglas de negocio y validaciones antes de interactuar con la base de datos.

---

## 2. Tecnologías y librerías del backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.10+ | Lenguaje base |
| FastAPI | 0.111.0 | Framework web y API REST |
| Uvicorn | 0.29.0 | Servidor ASGI |
| SQLAlchemy | 2.0.30 | ORM para manejo de base de datos |
| PostgreSQL | 15+ | Base de datos relacional |
| psycopg2-binary | 2.9.9 | Driver de conexión PostgreSQL |
| python-jose[cryptography] | 3.3.0 | Generación y validación de JWT |
| passlib[bcrypt] | 1.7.4 | Hash seguro de contraseñas |
| python-multipart | 0.0.9 | Soporte para formularios |
| python-dotenv | 1.0.1 | Gestión de variables de entorno |
| pydantic[email] | 2.7.1 | Validación de datos y schemas |

---

## 3. Estructura de carpetas del backend

```
Laboratorio-4/
├── app/
│   ├── api/
│   │   ├── auth.py          # Endpoints de login y registro
│   │   ├── usuarios.py      # Endpoints CRUD de usuarios
│   │   ├── espacios.py      # Endpoints CRUD de espacios
│   │   └── reservas.py      # Endpoints CRUD de reservas
│   ├── models/
│   │   ├── __init__.py      # Importaciones centralizadas
│   │   ├── usuario.py       # Modelo SQLAlchemy de usuarios
│   │   ├── espacio.py       # Modelo SQLAlchemy de espacios
│   │   └── reserva.py       # Modelo SQLAlchemy de reservas
│   ├── schemas/
│   │   ├── usuario.py       # Schemas Pydantic de usuarios
│   │   ├── espacio.py       # Schemas Pydantic de espacios
│   │   └── reserva.py       # Schemas Pydantic de reservas
│   ├── crud/
│   │   ├── usuario.py       # Lógica de acceso a datos - usuarios
│   │   ├── espacio.py       # Lógica de acceso a datos - espacios
│   │   └── reserva.py       # Lógica de acceso a datos + reglas de negocio
│   ├── auth/
│   │   └── jwt.py           # Creación y validación de tokens JWT
│   ├── db.py                # Conexión y sesión de base de datos
│   └── main.py              # Punto de entrada, routers y CORS
├── init_db.py               # Script para crear tablas y usuario admin
├── requirements.txt         # Dependencias del proyecto
├── .env                     # Variables de entorno (no se sube al repo)
└── .env.example             # Plantilla de variables de entorno
```

---

## 4. Diseño de base de datos

### Modelo Entidad-Relación

```
┌──────────────────┐         ┌──────────────────┐
│    usuarios      │         │    espacios       │
├──────────────────┤         ├──────────────────┤
│ id_usuario  PK   │         │ id_espacio  PK   │
│ nombre           │         │ nombre           │
│ correo  UNIQUE   │         │ ubicacion        │
│ contrasena       │         │ capacidad        │
│ rol              │         │ estado           │
└────────┬─────────┘         └────────┬─────────┘
         │ 1                          │ 1
         │                            │
         ▼ N                          ▼ N
┌──────────────────────────────────────────────┐
│                  reservas                    │
├──────────────────────────────────────────────┤
│ id_reserva          PK                       │
│ id_usuario          FK → usuarios            │
│ id_espacio          FK → espacios            │
│ fecha               DATE                     │
│ hora_inicio         TIME                     │
│ hora_fin            TIME                     │
│ cantidad_asistentes INTEGER                  │
│ estado              TEXT                     │
│                     (esperando/aprobada/     │
│                      rechazada)              │
└──────────────────────────────────────────────┘
```

### Tabla: usuarios

| Campo | Tipo | Restricción |
|-------|------|-------------|
| id_usuario | INTEGER | PK, autoincremental |
| nombre | TEXT | NOT NULL |
| correo | TEXT | NOT NULL, UNIQUE |
| contrasena | TEXT | NOT NULL (hash bcrypt) |
| rol | TEXT | NOT NULL — valores: `admin` / `usuario` |

### Tabla: espacios

| Campo | Tipo | Restricción |
|-------|------|-------------|
| id_espacio | INTEGER | PK, autoincremental |
| nombre | TEXT | NOT NULL |
| ubicacion | TEXT | NOT NULL |
| capacidad | INTEGER | NOT NULL |
| estado | TEXT | NOT NULL — valores: `activo` / `inactivo` / `en_mantenimiento` / `no_disponible` |

### Tabla: reservas

| Campo | Tipo | Restricción |
|-------|------|-------------|
| id_reserva | INTEGER | PK, autoincremental |
| id_usuario | INTEGER | FK → usuarios, NOT NULL |
| id_espacio | INTEGER | FK → espacios, NOT NULL |
| fecha | DATE | NOT NULL |
| hora_inicio | TIME | NOT NULL |
| hora_fin | TIME | NOT NULL |
| cantidad_asistentes | INTEGER | NOT NULL |
| estado | TEXT | NOT NULL, default: `esperando` |

---

## 5. Endpoints desarrollados

### Autenticación — `/api/v1/auth`

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/auth/login` | Inicia sesión y retorna JWT | No |
| POST | `/auth/register` | Registra un nuevo usuario | No |

**Request — login:**
```json
{
  "username": "admin@correo.com",
  "password": "admin123"
}
```

**Response — login:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "token_type": "bearer"
}
```

---

### Usuarios — `/api/v1/usuarios`

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| GET | `/usuarios/` | Lista todos los usuarios | admin |
| GET | `/usuarios/{id}` | Obtiene un usuario por ID | admin |
| PUT | `/usuarios/{id}` | Actualiza datos de un usuario | admin |
| DELETE | `/usuarios/{id}` | Elimina un usuario | admin |

---

### Espacios — `/api/v1/espacios`

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| POST | `/espacios/` | Crea un nuevo espacio | admin |
| GET | `/espacios/` | Lista todos los espacios | autenticado |
| GET | `/espacios/{id}` | Obtiene detalle de un espacio | autenticado |
| PUT | `/espacios/{id}` | Actualiza un espacio | admin |
| DELETE | `/espacios/{id}` | Elimina un espacio | admin |

**Request — crear espacio:**
```json
{
  "nombre": "Sala de Reuniones A",
  "ubicacion": "Piso 2",
  "capacidad": 10,
  "estado": "activo"
}
```

---

### Reservas — `/api/v1/reservas`

| Método | Ruta | Descripción | Rol requerido |
|--------|------|-------------|---------------|
| POST | `/reservas/` | Crea una reserva | autenticado |
| GET | `/reservas/` | Lista reservas (admin: todas / usuario: las suyas) | autenticado |
| GET | `/reservas/{id}` | Detalle de una reserva | autenticado |
| PUT | `/reservas/{id}/estado` | Aprueba o rechaza una reserva | admin |
| DELETE | `/reservas/{id}` | Cancela una reserva | dueño o admin |

**Request — crear reserva:**
```json
{
  "id_espacio": 1,
  "fecha": "2026-05-26",
  "hora_inicio": "09:00:00",
  "hora_fin": "11:00:00",
  "cantidad_asistentes": 5
}
```

**Response — reserva creada:**
```json
{
  "id_reserva": 1,
  "id_usuario": 2,
  "id_espacio": 1,
  "fecha": "2026-05-26",
  "hora_inicio": "09:00:00",
  "hora_fin": "11:00:00",
  "cantidad_asistentes": 5,
  "estado": "esperando"
}
```

**Response — error por conflicto de horario:**
```json
{
  "detail": "El espacio ya tiene una reserva activa en ese horario y fecha"
}
```

**Response — error por anticipación:**
```json
{
  "detail": "La reserva debe realizarse con al menos 24 horas de anticipación"
}
```

---

## 6. Modelo de autenticación JWT

### Flujo de autenticación

```
1. Usuario envía correo + contraseña  →  POST /api/v1/auth/login
2. Backend verifica credenciales contra la base de datos
3. Si son válidas, genera un JWT firmado con SECRET_KEY
4. El token se retorna al cliente
5. El cliente incluye el token en cada petición:
   Header: Authorization: Bearer <token>
6. El backend valida el token en cada endpoint protegido
```

### Contenido del token (payload)

```json
{
  "sub": "correo@ejemplo.com",
  "rol": "admin",
  "id": 1,
  "exp": 1234567890
}
```

### Dependencias de seguridad implementadas

| Dependencia | Archivo | Descripción |
|-------------|---------|-------------|
| `get_current_user` | `app/auth/jwt.py` | Valida el token y retorna el usuario activo |
| `require_admin` | `app/auth/jwt.py` | Extiende `get_current_user` y verifica rol admin |

### Roles del sistema

| Rol | Permisos |
|-----|----------|
| `usuario` | Consultar espacios · Crear reservas · Ver sus propias reservas · Cancelar sus reservas |
| `admin` | Todo lo anterior + Gestionar usuarios · Gestionar espacios · Ver todas las reservas · Aprobar/rechazar reservas |

---

## 7. Reglas de negocio implementadas

Todas las reglas se validan en `app/crud/reserva.py` mediante `HTTPException` con mensajes descriptivos.

| ID | Regla | Mensaje de error retornado |
|----|-------|---------------------------|
| A | Solo usuarios autenticados crean reservas | `Token inválido o expirado` |
| B | Solo admin aprueba o rechaza reservas | `Se requiere rol de administrador` |
| C | Sin reservas superpuestas en mismo espacio, fecha y horario | `El espacio ya tiene una reserva activa en ese horario y fecha` |
| D | Mínimo 24 horas de anticipación | `La reserva debe realizarse con al menos 24 horas de anticipación` |
| E | Lun–Vie 7:00–20:00 · Sáb 8:00–12:00 · Dom no permitido | `No se permiten reservas los domingos` / `Horario fuera del permitido` |
| F | hora_inicio debe ser menor que hora_fin | `La hora de inicio debe ser menor que la hora de fin` |
| G | El espacio debe estar en estado activo | `El espacio no está disponible (estado: inactivo / en_mantenimiento)` |
| H | Asistentes no puede superar capacidad del espacio | `La cantidad de asistentes supera la capacidad del espacio` |
| I | Estado inicial siempre esperando | Las reservas se crean automáticamente en estado `esperando` |

---

## 8. Instrucciones para ejecutar en modo desarrollo

### Requisitos previos

- Python 3.10 o superior
- PostgreSQL instalado y en ejecución
- Git

### Pasos

```bash
# 1. Clonar el repositorio y cambiar a rama dev
git clone https://github.com/tu-usuario/Laboratorio-4.git
cd Laboratorio-4
git checkout dev

# 2. Crear y activar el entorno virtual
python3 -m venv venv
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con los datos reales de PostgreSQL

# 5. Iniciar PostgreSQL y crear la base de datos
sudo service postgresql start
psql -U postgres -c "CREATE DATABASE reservas_db;"

# 6. Inicializar tablas y usuario admin por defecto
python init_db.py

# 7. Levantar el servidor en modo desarrollo
uvicorn app.main:app --reload
```

### URLs disponibles

| URL | Descripción |
|-----|-------------|
| http://localhost:8000 | Respuesta base de la API |
| http://localhost:8000/docs | Documentación interactiva Swagger UI |
| http://localhost:8000/redoc | Documentación alternativa ReDoc |

### Variables de entorno requeridas (`.env`)

| Variable | Descripción | Valor ejemplo |
|----------|-------------|---------------|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:admin123@localhost:5432/reservas_db` |
| `SECRET_KEY` | Clave secreta para firmar JWT | `clave_super_secreta_cambiala` |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token en minutos | `60` |
| `ADMIN_EMAIL` | Correo del usuario admin inicial | `admin@correo.com` |
| `ADMIN_PASSWORD` | Contraseña del admin inicial | `admin123` |
| `ADMIN_NOMBRE` | Nombre del admin inicial | `Administrador` |

---

