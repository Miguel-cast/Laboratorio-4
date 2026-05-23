from app.db import engine, SessionLocal, Base
from app.models import Usuario, Espacio, Reserva
from app.crud.usuario import create_usuario, get_usuario_by_correo
from app.schemas.usuario import UsuarioCreate
from dotenv import load_dotenv
import os

load_dotenv()

def init():
    print("Creando tablas...")
    Base.metadata.create_all(bind=engine)
    print("Tablas creadas.")

    db = SessionLocal()
    correo = os.getenv("ADMIN_EMAIL", "admin@correo.com")
    if not get_usuario_by_correo(db, correo):
        admin = UsuarioCreate(
            nombre     = os.getenv("ADMIN_NOMBRE", "Administrador"),
            correo     = correo,
            contrasena = os.getenv("ADMIN_PASSWORD", "admin123"),
            rol        = "admin"
        )
        create_usuario(db, admin)
        print(f"Admin creado: {correo}")
    else:
        print("Admin ya existe.")
    db.close()

if __name__ == "__main__":
    init()