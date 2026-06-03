"""
Script de inicialización: crea tablas y carga datos de prueba.
Ejecutar una sola vez: python init_db.py
"""
import os
from dotenv import load_dotenv
load_dotenv()

from app.db import engine, Base, SessionLocal
from app.models import usuario, espacio, reserva  # noqa: registra modelos en Base
from app.crud.usuario import create_usuario, get_usuario_by_correo
from app.crud.espacio import create_espacio, get_espacios
from app.schemas.usuario import UsuarioCreate
from app.schemas.espacio import EspacioCreate

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Admin
        admin_email = os.getenv("ADMIN_EMAIL", "admin@correo.com")
        if not get_usuario_by_correo(db, admin_email):
            from app.models.usuario import Usuario
            from app.crud.usuario import hash_password
            admin = Usuario(
                nombre=os.getenv("ADMIN_NOMBRE", "Administrador"),
                correo=admin_email,
                contrasena=hash_password(os.getenv("ADMIN_PASSWORD", "admin123")),
                rol="admin",
            )
            db.add(admin)
            db.commit()
            print(f"[+] Admin creado: {admin_email}")
        else:
            print(f"[=] Admin ya existe: {admin_email}")

        # Usuario normal
        user_email = "usuario@correo.com"
        if not get_usuario_by_correo(db, user_email):
            u = UsuarioCreate(nombre="Juan Pérez", correo=user_email, contrasena="usuario123")
            create_usuario(db, u)
            print(f"[+] Usuario creado: {user_email}")
        else:
            print(f"[=] Usuario ya existe: {user_email}")

        # Espacios de ejemplo
        if not get_espacios(db):
            for data in [
                EspacioCreate(nombre="Sala A", ubicacion="Bloque 1 - Piso 2", capacidad=20, estado="activo"),
                EspacioCreate(nombre="Laboratorio de Cómputo", ubicacion="Bloque 3 - Piso 1", capacidad=35, estado="activo"),
                EspacioCreate(nombre="Auditorio Principal", ubicacion="Edificio Central", capacidad=200, estado="activo"),
            ]:
                create_espacio(db, data)
                print(f"[+] Espacio creado: {data.nombre}")
        else:
            print("[=] Espacios ya existen, omitiendo seed")

        print("\n✓ Base de datos inicializada correctamente.")
        print("  Admin:   admin@correo.com  /  admin123")
        print("  Usuario: usuario@correo.com / usuario123")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
