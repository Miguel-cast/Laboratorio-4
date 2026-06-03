<div align="center">

# 🏛️ Reservas Institucionales

### Plataforma web para la gestión inteligente de reservas de espacios institucionales

*Autenticación con JWT · Control de acceso por roles · Reglas de negocio · Despliegue en contenedores*

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)

<br/>

[![Estado](https://img.shields.io/badge/estado-en%20producci%C3%B3n-success?style=flat-square)](#-despliegue)
[![Arquitectura](https://img.shields.io/badge/arquitectura-3%20capas-blue?style=flat-square)](#-arquitectura)
[![API REST](https://img.shields.io/badge/API-REST-orange?style=flat-square)](#-api-rest)
[![Licencia](https://img.shields.io/badge/licencia-MIT-lightgrey?style=flat-square)](#-licencia)

</div>

---

> [!NOTE]
> Este documento describe **la arquitectura, el diseño y la ingeniería** del proyecto. La aplicación se ejecuta **desplegada en contenedores sobre un servidor**, por lo que no requiere instalación local para ser utilizada — basta con acceder a la URL de producción.

<br/>

## 📑 Tabla de contenido

- [✨ Visión general](#-visión-general)
- [🎯 El problema que resuelve](#-el-problema-que-resuelve)
- [🚀 Características](#-características)
- [🏗️ Arquitectura](#-arquitectura)
- [🧱 Stack tecnológico](#-stack-tecnológico)
- [🗃️ Modelo de datos](#-modelo-de-datos)
- [📐 Reglas de negocio](#-reglas-de-negocio)
- [🔌 API REST](#-api-rest)
- [🔐 Autenticación y autorización](#-autenticación-y-autorización)
- [🎨 Experiencia de usuario](#-experiencia-de-usuario)
- [🗂️ Estructura del proyecto](#-estructura-del-proyecto)
- [🌳 Flujo de trabajo Git](#-flujo-de-trabajo-git)
- [☁️ Despliegue](#-despliegue)
- [👥 Equipo](#-equipo)
- [📄 Licencia](#-licencia)

<br/>

## ✨ Visión general

**Reservas Institucionales** es una aplicación web full-stack que permite a una institución administrar la reserva de espacios —salas de reuniones, laboratorios, auditorios o aulas especiales— evitando conflictos de horario, solicitudes fuera del horario permitido y reservas con poca anticipación.

El sistema está construido sobre una **arquitectura de tres capas** desacoplada y contenerizada, con una **API REST** segura, **autenticación basada en JWT**, **control de acceso por roles** y un conjunto de **reglas de negocio** que garantizan la integridad de cada reserva.

<div align="center">

| 🧩 Componente | 💼 Responsabilidad |
|:---|:---|
| **Frontend** | Interfaz reactiva que consume la API y adapta sus vistas según el rol |
| **Backend** | API REST que aplica autenticación, autorización y reglas de negocio |
| **Base de datos** | Persistencia relacional de usuarios, espacios y reservas |

</div>

<br/>

## 🎯 El problema que resuelve

En muchas instituciones la reserva de espacios se gestiona de forma manual (correos, hojas de cálculo, mensajería), lo que genera:

- ❌ **Dobles reservas** sobre el mismo espacio y horario.
- ❌ **Solicitudes de último minuto** imposibles de coordinar.
- ❌ **Uso de espacios** en mantenimiento o no disponibles.
- ❌ **Falta de trazabilidad** sobre quién reservó qué y cuándo.

Esta plataforma centraliza el proceso y **valida automáticamente** cada solicitud contra un motor de reglas, dejando un registro auditable y un flujo de aprobación claro.

<br/>

## 🚀 Características

<table>
<tr>
<td width="50%" valign="top">

#### 👤 Para usuarios
- 🔑 Registro e inicio de sesión seguro
- 🏢 Exploración de espacios disponibles
- 📅 Creación de reservas con validación en tiempo real
- 📋 Seguimiento del estado de sus solicitudes
- 🚫 Cancelación de reservas propias

</td>
<td width="50%" valign="top">

#### 🛡️ Para administradores
- ✅ Aprobación / rechazo de solicitudes
- 🏗️ Gestión completa de espacios (CRUD)
- 👥 Administración de usuarios
- 📊 Panel con métricas en vivo
- 🔍 Visibilidad de todas las reservas

</td>
</tr>
</table>

#### ⚙️ Características transversales

`API REST` · `JWT con expiración` · `Hash de contraseñas con bcrypt` · `Validación de 9 reglas de negocio` · `Documentación interactiva (Swagger/OpenAPI)` · `Interfaz animada con WebGL` · `Despliegue reproducible con Docker Compose`

<br/>

## 🏗️ Arquitectura

El sistema sigue una arquitectura de **tres capas** desacopladas, cada una en su propio contenedor, comunicadas a través de una red privada de Docker.

```mermaid
flowchart LR
    subgraph Cliente
        U([👤 Navegador])
    end

    subgraph Docker["🐳 Orquestación Docker Compose"]
        direction LR
        F["🖥️ Frontend<br/>HTML · CSS · JS<br/>Nginx :80"]
        B["⚙️ Backend<br/>FastAPI · Uvicorn<br/>:8000"]
        D[("🗄️ PostgreSQL<br/>:5432")]
    end

    U -->|HTTPS| F
    F -->|REST · JWT| B
    B -->|SQLAlchemy ORM| D

    style F fill:#1e293b,stroke:#6366f1,color:#fff
    style B fill:#1e293b,stroke:#009688,color:#fff
    style D fill:#1e293b,stroke:#4169E1,color:#fff
```

#### Flujo de una petición autenticada

```mermaid
sequenceDiagram
    autonumber
    participant C as 🖥️ Frontend
    participant A as ⚙️ API (FastAPI)
    participant J as 🔐 Capa JWT
    participant DB as 🗄️ PostgreSQL

    C->>A: POST /auth/login (correo, contraseña)
    A->>DB: Buscar usuario por correo
    DB-->>A: Usuario + hash
    A->>A: Verificar hash (bcrypt)
    A-->>C: access_token (JWT firmado)
    C->>A: GET /reservas (Authorization: Bearer)
    A->>J: Validar firma y expiración
    J-->>A: Identidad + rol
    A->>DB: Consultar según rol
    DB-->>A: Datos
    A-->>C: 200 OK (JSON)
```

<br/>

## 🧱 Stack tecnológico

<div align="center">

| Capa | Tecnología | Propósito |
|:---|:---|:---|
| **Backend** | ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white) | Framework web asíncrono y API REST |
| | ![Uvicorn](https://img.shields.io/badge/-Uvicorn-2C3E50?logo=gunicorn&logoColor=white) | Servidor ASGI de alto rendimiento |
| | ![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy%202.0-D71F00?logo=sqlalchemy&logoColor=white) | ORM y capa de acceso a datos |
| | ![Pydantic](https://img.shields.io/badge/-Pydantic%20v2-E92063?logo=pydantic&logoColor=white) | Validación y serialización de esquemas |
| **Seguridad** | ![JWT](https://img.shields.io/badge/-python--jose-000000?logo=jsonwebtokens&logoColor=white) | Emisión y validación de tokens JWT |
| | ![bcrypt](https://img.shields.io/badge/-passlib%20·%20bcrypt-4B8BBE) | Hash seguro de contraseñas |
| **Base de datos** | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL%2015-4169E1?logo=postgresql&logoColor=white) | Motor relacional |
| **Frontend** | ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white) ![JS](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black) | Interfaz sin frameworks pesados |
| | ![Three.js](https://img.shields.io/badge/-Three.js-000000?logo=threedotjs&logoColor=white) | Fondo animado con shaders WebGL |
| **DevOps** | ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/-Nginx-009639?logo=nginx&logoColor=white) | Contenerización y servidor estático |

</div>

<br/>

## 🗃️ Modelo de datos

Tres entidades principales relacionadas mediante claves foráneas: un usuario puede tener muchas reservas y un espacio puede recibir muchas reservas.

```mermaid
erDiagram
    USUARIOS ||--o{ RESERVAS : "realiza"
    ESPACIOS ||--o{ RESERVAS : "recibe"

    USUARIOS {
        int     id_usuario PK
        string  nombre
        string  correo UK
        string  contrasena "hash bcrypt"
        string  rol "admin | usuario"
    }
    ESPACIOS {
        int     id_espacio PK
        string  nombre
        string  ubicacion
        int     capacidad
        string  estado "activo | inactivo | mantenimiento | no disponible"
    }
    RESERVAS {
        int     id_reserva PK
        int     id_usuario FK
        int     id_espacio FK
        date    fecha
        time    hora_inicio
        time    hora_fin
        int     cantidad_asistentes
        string  estado "esperando | aprobada | rechazada"
    }
```

#### Ciclo de vida de una reserva

```mermaid
stateDiagram-v2
    [*] --> esperando: Usuario crea la reserva
    esperando --> aprobada: Admin aprueba
    esperando --> rechazada: Admin rechaza
    aprobada --> [*]: Cancelada por dueño/admin
    esperando --> [*]: Cancelada por dueño/admin
    note right of esperando
        Las reservas en "esperando"
        y "aprobada" bloquean el horario.
        Las "rechazadas" lo liberan.
    end note
```

<br/>

## 📐 Reglas de negocio

El backend valida **cada reserva** contra el siguiente motor de reglas antes de persistirla. Si alguna falla, responde con un mensaje claro y un código de error apropiado.

| # | Regla | Validación |
|:---:|:---|:---|
| **1** | 🔓 Solo usuarios autenticados pueden crear reservas | Token JWT válido |
| **2** | 👮 Solo `admin` puede aprobar o rechazar | Autorización por rol |
| **3** | 🚫 Sin solapamientos | No se permite reservar un espacio ya ocupado en esa fecha y franja horaria |
| **4** | ⏰ Anticipación mínima | La reserva debe hacerse con **≥ 24 horas** de antelación |
| **5** | 📅 Horario permitido | Lun–Vie **7:00–20:00** · Sáb **8:00–12:00** · Dom **cerrado** |
| **6** | ↔️ Coherencia horaria | `hora_inicio` debe ser **menor** que `hora_fin` |
| **7** | 🛠️ Espacios disponibles | No se reservan espacios `inactivo`, `en mantenimiento` o `no disponible` |
| **8** | 👥 Aforo | La cantidad de asistentes no puede **superar la capacidad** del espacio |
| **9** | 🏷️ Estado inicial | Toda reserva nace en `esperando`; solo `admin` la cambia a `aprobada`/`rechazada` |

<br/>

## 🔌 API REST

Base URL: `/api/v1` · Documentación interactiva autogenerada en `/docs` (Swagger UI) y `/redoc`.

<details open>
<summary><b>🔑 Autenticación</b> &nbsp;<code>/auth</code></summary>

<br/>

| Método | Endpoint | Descripción | Acceso |
|:---:|:---|:---|:---:|
| `POST` | `/auth/register` | Registra un nuevo usuario | 🌐 Público |
| `POST` | `/auth/login` | Inicia sesión y devuelve un JWT | 🌐 Público |

</details>

<details>
<summary><b>👥 Usuarios</b> &nbsp;<code>/usuarios</code></summary>

<br/>

| Método | Endpoint | Descripción | Acceso |
|:---:|:---|:---|:---:|
| `GET` | `/usuarios/` | Lista todos los usuarios | 🛡️ Admin |
| `GET` | `/usuarios/{id}` | Obtiene un usuario | 🛡️ Admin |
| `PUT` | `/usuarios/{id}` | Actualiza un usuario | 🛡️ Admin |
| `DELETE` | `/usuarios/{id}` | Elimina un usuario | 🛡️ Admin |

</details>

<details>
<summary><b>🏢 Espacios</b> &nbsp;<code>/espacios</code></summary>

<br/>

| Método | Endpoint | Descripción | Acceso |
|:---:|:---|:---|:---:|
| `POST` | `/espacios/` | Crea un espacio | 🛡️ Admin |
| `GET` | `/espacios/` | Lista los espacios | 🔒 Autenticado |
| `GET` | `/espacios/{id}` | Detalle de un espacio | 🔒 Autenticado |
| `PUT` | `/espacios/{id}` | Actualiza un espacio | 🛡️ Admin |
| `DELETE` | `/espacios/{id}` | Elimina un espacio | 🛡️ Admin |

</details>

<details>
<summary><b>📅 Reservas</b> &nbsp;<code>/reservas</code></summary>

<br/>

| Método | Endpoint | Descripción | Acceso |
|:---:|:---|:---|:---:|
| `POST` | `/reservas/` | Crea una reserva (valida las 9 reglas) | 🔒 Autenticado |
| `GET` | `/reservas/` | Lista reservas (admin: todas · usuario: las suyas) | 🔒 Autenticado |
| `GET` | `/reservas/{id}` | Detalle de una reserva | 🔒 Autenticado |
| `PUT` | `/reservas/{id}/estado` | Aprueba o rechaza | 🛡️ Admin |
| `DELETE` | `/reservas/{id}` | Cancela una reserva | 🔒 Dueño o Admin |

</details>

<br/>

## 🔐 Autenticación y autorización

```mermaid
flowchart TD
    L[POST /auth/login] --> V{Credenciales validas}
    V -->|No| E[401 - Credenciales invalidas]
    V -->|Si| T[Genera JWT firmado con SECRET_KEY<br/>payload: sub, rol, id, exp]
    T --> C[El cliente guarda el token]
    C --> R[Cada peticion protegida envia<br/>Authorization: Bearer token]
    R --> G{Token valido y vigente}
    G -->|No| E2[401 - Token invalido o expirado]
    G -->|Si| Rol{Endpoint requiere admin}
    Rol -->|No| OK[Acceso concedido]
    Rol -->|Si, y es admin| OK
    Rol -->|Si, pero no admin| F[403 - Se requiere rol admin]

    style OK fill:#064e3b,stroke:#34d399,color:#fff
    style E fill:#450a0a,stroke:#f87171,color:#fff
    style E2 fill:#450a0a,stroke:#f87171,color:#fff
    style F fill:#450a0a,stroke:#f87171,color:#fff
```

- **Contraseñas** almacenadas con hash **bcrypt** (nunca en texto plano).
- **Tokens JWT** firmados con `HS256` y **expiración configurable**.
- Dependencias de FastAPI `get_current_user` y `require_admin` protegen cada endpoint.

<br/>

## 🎨 Experiencia de usuario

La interfaz fue diseñada con un lenguaje visual **premium y oscuro**, priorizando la claridad y el detalle:

- 🌌 **Pantallas de acceso** con fondo animado de matriz de puntos renderizado por **shaders WebGL** (Three.js).
- 🪄 **Dashboard** con _aurora_ animada, tarjetas _glassmorphism_, entrada escalonada y micro-interacciones.
- 📊 **Métricas en vivo** con animación de conteo.
- 🔔 **Notificaciones tipo toast**, **modales** animados y **skeleton loaders**.
- 📱 **Diseño responsivo** y accesible.

> Las vistas se adaptan dinámicamente según el rol: un usuario ve sus reservas y los espacios disponibles; un administrador obtiene además paneles de gestión y aprobación.

<br/>

## 🗂️ Estructura del proyecto

```
Reservas-Institucionales/
├── app/                        # ⚙️ Backend (FastAPI)
│   ├── api/                    #   Routers / endpoints
│   │   ├── auth.py             #     Login y registro
│   │   ├── usuarios.py         #     CRUD de usuarios
│   │   ├── espacios.py         #     CRUD de espacios
│   │   └── reservas.py         #     CRUD + flujo de reservas
│   ├── models/                 #   Modelos SQLAlchemy (ORM)
│   ├── schemas/                #   Esquemas Pydantic (validación)
│   ├── crud/                   #   Lógica de acceso a datos + reglas de negocio
│   ├── auth/                   #   Emisión y verificación de JWT
│   ├── db.py                   #   Conexión y sesión de base de datos
│   └── main.py                 #   Punto de entrada, routers y CORS
│
├── frontend/                   # 🖥️ Cliente (HTML · CSS · JS)
│   ├── index.html              #   Inicio de sesión
│   ├── register.html           #   Registro
│   ├── dashboard.html          #   Panel principal
│   ├── auth.js · api.js        #   Lógica de auth y capa de API
│   ├── dashboard.js            #   Interacción del panel
│   ├── canvas-bg.js            #   Fondo WebGL (shaders)
│   ├── style.css · dashboard.css
│   └── config.js               #   Configuración del cliente
│
├── init_db.py                  # 🌱 Inicialización y datos semilla
├── requirements.txt            # 📦 Dependencias Python
├── docker-compose.yml          # 🐳 Orquestación de servicios
├── Dockerfile.backend          #   Imagen del backend
├── Dockerfile.frontend         #   Imagen del frontend (Nginx)
└── nginx.conf                  #   Configuración del servidor web
```

<br/>

## 🌳 Flujo de trabajo Git

El repositorio sigue una estrategia de ramas inspirada en **Git Flow**, con separación clara entre desarrollo, operaciones e integración final.

```mermaid
gitGraph
    commit id: "init"
    branch dev
    checkout dev
    commit id: "backend"
    commit id: "frontend-base"
    branch feature/redesign-auth-ui
    checkout feature/redesign-auth-ui
    commit id: "auth-redesign"
    branch feature/redesign-dashboard
    checkout feature/redesign-dashboard
    commit id: "dashboard-premium"
    checkout dev
    merge feature/redesign-auth-ui
    merge feature/redesign-dashboard
    branch ops
    checkout ops
    commit id: "docker-nginx"
    checkout main
    merge ops tag: "release"
```

<div align="center">

| Rama | Propósito |
|:---|:---|
| 🟣 `main` | Integración final y versión estable desplegada |
| 🔵 `dev` | Desarrollo activo del frontend y backend |
| 🟢 `ops` | Configuración de despliegue (Docker, Nginx, variables) |
| 🌿 `feature/*` | Funcionalidades aisladas, integradas vía Pull Request |

</div>

> Cada funcionalidad se desarrolla en su propia rama `feature/*` y se integra a `dev` mediante **Pull Requests** revisados, garantizando un historial limpio y trazable.

<br/>

## ☁️ Despliegue

La aplicación está **contenerizada y desplegada** sobre un servidor mediante **Docker Compose**, que orquesta tres servicios aislados en una red privada:

```mermaid
flowchart TB
    Internet([🌍 Internet]) -->|HTTPS| N
    subgraph Servidor["☁️ Servidor de producción"]
        N["🌐 Nginx · sirve el frontend"]
        API["⚙️ FastAPI · Uvicorn"]
        PG[("🗄️ PostgreSQL · volumen persistente")]
        N --> API --> PG
    end

    style N fill:#1e293b,stroke:#009639,color:#fff
    style API fill:#1e293b,stroke:#009688,color:#fff
    style PG fill:#1e293b,stroke:#4169E1,color:#fff
```

- 🔄 **Reproducible:** un único `docker compose up` levanta todo el sistema.
- 🔒 **Aislado:** la base de datos solo es accesible desde la red interna.
- 💾 **Persistente:** los datos sobreviven a reinicios mediante volúmenes.
- 🩺 **Resiliente:** _health checks_ y políticas de reinicio automático.

> 🔗 **Acceso:** la plataforma se consume directamente desde la URL de producción. _(La documentación operativa detallada se encuentra en la rama `ops`.)_

<br/>

## 👥 Equipo

<div align="center">

| Integrante | GitHub |
|:---|:---:|
| Juan Cardona | [![@Juanka690](https://img.shields.io/badge/-@Juanka690-181717?style=flat-square&logo=github)](https://github.com/Juanka690) |
| Miguel | [![@Miguel-cast](https://img.shields.io/badge/-@Miguel--cast-181717?style=flat-square&logo=github)](https://github.com/Miguel-cast) |

</div>

<br/>

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.

---

<div align="center">

**Desarrollado con ❤️ para la asignatura de Aplicaciones y Servicios Web**

<sub>Tecnología en Desarrollo de Software · Laboratorio Integrador DevOps</sub>

</div>
