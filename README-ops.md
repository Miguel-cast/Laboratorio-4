# README — Despliegue con Docker (Ops)

## Laboratorio 4 — Gestión de Reservas de Espacios Institucionales

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| Docker Engine | 24.x |
| Docker Compose | v2.x (`docker compose`) |

> No necesitas Python, Node.js ni PostgreSQL instalados localmente.

---

## Variables de entorno

Crea el archivo `.env` en la raíz del proyecto a partir de la plantilla:

```bash
cp .env.example .env
```

Edita `.env` con los valores reales:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Usuario de la base de datos | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña de la base de datos | `admin123` |
| `POSTGRES_DB` | Nombre de la base de datos | `reservas_db` |
| `SECRET_KEY` | Clave secreta para JWT — **cámbiala en producción** | `cambia_esta_clave` |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token (minutos) | `60` |
| `ADMIN_EMAIL` | Correo del admin inicial | `admin@correo.com` |
| `ADMIN_PASSWORD` | Contraseña del admin inicial | `admin123` |
| `ADMIN_NOMBRE` | Nombre del admin inicial | `Administrador` |
| `BACKEND_URL` | URL del backend que usa el frontend | `http://localhost:8000` |

---

## Build y ejecución

```bash
# 1. Clona el repositorio
git clone https://github.com/Juanka690/Laboratorio-4.git
cd Laboratorio-4

# 2. Crea el archivo de entorno
cp .env.example .env
# Edita .env si necesitas cambiar las claves

# 3. Construye e inicia todos los servicios
docker compose up --build

# En modo detach (segundo plano)
docker compose up --build -d
```

El primer arranque tarda ~1-2 minutos porque:
1. Descarga las imágenes base
2. Instala dependencias Python
3. Espera a que PostgreSQL esté listo (healthcheck)
4. Ejecuta `init_db.py` para crear tablas y datos de prueba

---

## Puertos

| Servicio | Puerto local | URL |
|----------|-------------|-----|
| Frontend (nginx) | 3000 | http://localhost:3000 |
| Backend (FastAPI) | 8000 | http://localhost:8000 |
| Documentación Swagger | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | `localhost:5432` (solo acceso interno) |

---

## Verificación rápida

```bash
# Estado de los contenedores
docker compose ps

# Health del backend
curl http://localhost:8000/

# Login con el admin de prueba
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=admin@correo.com&password=admin123"

# Ver espacios (requiere token del paso anterior)
curl http://localhost:8000/api/v1/espacios/ \
  -H "Authorization: Bearer <token>"
```

---

## Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Admin | admin@correo.com | admin123 |
| Usuario | usuario@correo.com | usuario123 |

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Solo logs del backend
docker compose logs -f backend

# Detener todo (conserva datos)
docker compose down

# Detener y BORRAR la base de datos
docker compose down -v

# Reconstruir solo el backend tras cambios en código
docker compose up --build backend
```

---

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---------|---------------|---------|
| `backend` sale con error de conexión | DB no está lista aún | Espera el healthcheck; el compose ya lo maneja |
| Puerto 8000 ocupado | Otro proceso usa ese puerto | Cambia en `docker-compose.yml`: `"8001:8000"` |
| Puerto 3000 ocupado | Otro proceso usa ese puerto | Cambia en `docker-compose.yml`: `"3001:80"` |
| Frontend no conecta al backend | `BACKEND_URL` incorrecta | Asegúrate de que `.env` tenga `BACKEND_URL=http://localhost:8000` |
| Login falla desde el navegador | CORS bloqueando | El backend ya tiene CORS abierto (`allow_origins=["*"]`) |
| Cambios en el frontend no se ven | Caché del navegador | `Ctrl+Shift+R` para recargar sin caché |
