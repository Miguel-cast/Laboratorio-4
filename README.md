<div align="center">

# 🏛️ Reservas Institucionales

### Plataforma web para la gestión inteligente de reservas de espacios institucionales

*Informe final y manual de usuario*

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br/>

[![Estado](https://img.shields.io/badge/estado-funcional-success?style=flat-square)](#-resumen-del-despliegue)
[![Ramas](https://img.shields.io/badge/ramas-main%20·%20dev%20·%20ops-blue?style=flat-square)](#-organización-del-repositorio)
[![Licencia](https://img.shields.io/badge/licencia-MIT-lightgrey?style=flat-square)](#-licencia)

</div>

---

> [!NOTE]
> Este README de la rama **`main`** es el **informe final y manual de usuario** del proyecto. La documentación técnica está en la rama [`dev`](../../tree/dev) y la de despliegue en la rama [`ops`](../../tree/ops).

<br/>

## 📑 Contenido

- [Descripción y objetivo](#-descripción-y-objetivo)
- [Integrantes del equipo](#-integrantes-del-equipo)
- [¿Qué hace y qué problema resuelve?](#-qué-hace-y-qué-problema-resuelve)
- [Arquitectura general y tecnologías](#-arquitectura-general-y-tecnologías)
- [Resumen del despliegue](#-resumen-del-despliegue)
- [Manual de uso](#-manual-de-uso)
- [Organización del repositorio](#-organización-del-repositorio)
- [Conclusiones y aprendizajes](#-conclusiones-y-aprendizajes)
- [Licencia](#-licencia)

<br/>

## 🎯 Descripción y objetivo

**Reservas Institucionales** es una aplicación web full-stack que permite a una institución administrar la reserva de espacios —salas de reuniones, laboratorios, auditorios o aulas especiales— de forma centralizada, segura y trazable.

**Objetivo general:** desarrollar y desplegar una aplicación web para la gestión de reservas de espacios institucionales, integrando frontend, backend y base de datos mediante contenedores Docker, aplicando autenticación con JWT, control de acceso por roles y reglas de negocio.

<br/>

## 👥 Integrantes del equipo

<div align="center">

| Integrante | Rol principal | GitHub |
|:---|:---|:---:|
| **Juan Cardona** | Frontend · DevOps · Integración | [![@Juanka690](https://img.shields.io/badge/-@Juanka690-181717?style=flat-square&logo=github)](https://github.com/Juanka690) |
| **Miguel** | Backend · Base de datos | [![@Miguel-cast](https://img.shields.io/badge/-@Miguel--cast-181717?style=flat-square&logo=github)](https://github.com/Miguel-cast) |

</div>

> _Los roles reflejan el foco principal de cada integrante; el trabajo se integró de forma colaborativa mediante ramas y Pull Requests._

<br/>

## ❓ ¿Qué hace y qué problema resuelve?

En muchas instituciones la reserva de espacios se gestiona de forma manual (correos, hojas de cálculo), lo que provoca **dobles reservas**, **solicitudes de último minuto**, **uso de espacios no disponibles** y **falta de trazabilidad**.

Esta plataforma centraliza el proceso y **valida automáticamente** cada solicitud:

<table>
<tr>
<td width="50%" valign="top">

#### 👤 El usuario puede
- Registrarse e iniciar sesión
- Explorar los espacios disponibles
- Crear reservas (validadas en el acto)
- Consultar el estado de sus solicitudes
- Cancelar sus reservas

</td>
<td width="50%" valign="top">

#### 🛡️ El administrador puede
- Aprobar o rechazar solicitudes
- Gestionar espacios (crear, editar, eliminar)
- Gestionar usuarios (crear, editar, eliminar)
- Editar reservas y ver todas las del sistema
- Consultar métricas en el panel

</td>
</tr>
</table>

<br/>

## 🏗️ Arquitectura general y tecnologías

Arquitectura de **tres capas** contenerizadas, comunicadas por una API REST con autenticación JWT.

```mermaid
flowchart LR
    U([👤 Usuario]) -->|HTTPS| F["🖥️ Frontend<br/>HTML · CSS · JS · WebGL"]
    F -->|REST · JWT| B["⚙️ Backend<br/>FastAPI · Uvicorn"]
    B -->|SQLAlchemy| D[("🗄️ PostgreSQL")]

    style F fill:#1e293b,stroke:#6366f1,color:#fff
    style B fill:#1e293b,stroke:#009688,color:#fff
    style D fill:#1e293b,stroke:#4169E1,color:#fff
```

| Capa | Tecnologías |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript, Three.js (WebGL) |
| **Backend** | FastAPI, Uvicorn, SQLAlchemy, Pydantic, python-jose (JWT), passlib/bcrypt |
| **Base de datos** | PostgreSQL 15 |
| **DevOps** | Docker, Docker Compose, Nginx |

<br/>

## ☁️ Resumen del despliegue

El sistema se despliega con **Docker Compose** en Linux o Windows (WSL), orquestando tres contenedores —frontend (Nginx), backend (FastAPI) y base de datos (PostgreSQL)— en una red privada con un volumen persistente para los datos.

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend / API | http://localhost:8000 |
| Documentación (Swagger) | http://localhost:8000/docs |

> 🔧 Los pasos detallados de construcción, ejecución y operación están en la rama [`ops`](../../tree/ops).

<br/>

## 📖 Manual de uso

> 🖼️ _Las siguientes imágenes son marcadores. Reemplaza cada URL por una captura real del sistema (sugerencia: súbelas a una carpeta `docs/img/` del repositorio)._

### 1. Inicio de sesión y registro
Accede con tu correo y contraseña. Si no tienes cuenta, regístrate desde el enlace inferior.

![Inicio de sesión](https://placehold.co/900x500/0c0e16/8b5cf6/png?text=1.+Inicio+de+sesion)

### 2. Panel principal (dashboard)
Tras iniciar sesión verás el panel con un resumen de tu actividad y la navegación por pestañas.

![Dashboard](https://placehold.co/900x500/0c0e16/8b5cf6/png?text=2.+Panel+principal)

### 3. Consultar espacios y crear una reserva
En **Espacios** explora los disponibles y pulsa **Reservar**: elige fecha, horario y número de asistentes. El sistema valida las reglas de negocio en el momento.

![Crear reserva](https://placehold.co/900x500/0c0e16/8b5cf6/png?text=3.+Crear+reserva)

### 4. Consultar y cancelar tus reservas
En **Mis reservas** revisas el estado de cada solicitud (esperando, aprobada, rechazada) y puedes cancelarlas.

![Mis reservas](https://placehold.co/900x500/0c0e16/8b5cf6/png?text=4.+Mis+reservas)

### 5. Gestión de espacios y aprobación (administrador)
El administrador crea/edita/elimina espacios y **aprueba o rechaza** las reservas pendientes.

![Gestión admin](https://placehold.co/900x500/0c0e16/8b5cf6/png?text=5.+Gestion+admin)

### 6. Gestión de usuarios (administrador)
Desde **Usuarios**, el administrador crea, edita y elimina cuentas, asignando el rol correspondiente.

![Gestión de usuarios](https://placehold.co/900x500/0c0e16/8b5cf6/png?text=6.+Gestion+de+usuarios)

### 7. Mensajes de error y cierre de sesión
Cuando una reserva incumple una regla, el sistema muestra un mensaje claro. Para salir, usa el botón de cerrar sesión.

![Mensajes y logout](https://placehold.co/900x500/0c0e16/8b5cf6/png?text=7.+Mensajes+y+cierre+de+sesion)

> **Credenciales de prueba:** `admin@correo.com / admin123` (administrador) · `usuario@correo.com / usuario123` (usuario).

<br/>

## 🌳 Organización del repositorio

El proyecto sigue una estrategia de ramas inspirada en **Git Flow**:

```mermaid
gitGraph
    commit id: "init"
    branch dev
    checkout dev
    commit id: "backend + frontend"
    commit id: "rediseno UI"
    commit id: "CRUD admin"
    branch ops
    checkout ops
    commit id: "docker + nginx"
    checkout main
    merge ops tag: "release"
```

| Rama | Contenido | README |
|---|---|---|
| 🟣 [`main`](../../tree/main) | Integración final · versión estable | Informe y manual de usuario |
| 🔵 [`dev`](../../tree/dev) | Desarrollo de frontend y backend | Documentación técnica |
| 🟢 [`ops`](../../tree/ops) | Configuración de despliegue | Documentación de despliegue |

<br/>

## 🧠 Conclusiones y aprendizajes

#### ✅ Conclusiones
- Se desarrolló y desplegó una aplicación web **funcional y completa** que integra frontend, backend y base de datos en contenedores.
- La separación en capas y la **arquitectura modular** del backend facilitaron implementar autenticación, roles y un motor de **9 reglas de negocio** mantenibles.
- El uso de **Docker Compose** hizo el despliegue **reproducible** y consistente entre entornos.

#### 🧩 Dificultades
- Coordinar las **reglas de negocio** de las reservas (solapamientos, anticipación, horarios) y revalidarlas también al **editar**.
- Manejar el **flujo de autenticación JWT** entre frontend y backend (almacenamiento del token, expiración, control por rol).
- Orquestar la **comunicación entre contenedores** y los tiempos de arranque (healthcheck de la base de datos).

#### 📚 Aprendizajes
- Diseño e implementación de una **API REST** segura con FastAPI y validación con Pydantic.
- Autenticación y autorización con **JWT** y control de acceso por roles.
- Contenerización y orquestación de servicios con **Docker** y **Docker Compose**.
- Trabajo colaborativo con **Git/GitHub** mediante ramas y Pull Requests.

#### 🚀 Mejoras futuras
- Notificaciones por correo al aprobar/rechazar reservas.
- Calendario visual de disponibilidad por espacio.
- Paginación y búsqueda en los listados.
- Pruebas automatizadas (unitarias e integración) y CI/CD.

<br/>

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE).

---

<div align="center">

**Desarrollado para la asignatura de Aplicaciones y Servicios Web**

<sub>Tecnología en Desarrollo de Software · Laboratorio Integrador DevOps</sub>

</div>
