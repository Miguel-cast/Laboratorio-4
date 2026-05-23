from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_usuario(db: Session, id: int):
    return db.query(Usuario).filter(Usuario.id_usuario == id).first()

def get_usuario_by_correo(db: Session, correo: str):
    return db.query(Usuario).filter(Usuario.correo == correo).first()

def get_usuarios(db: Session):
    return db.query(Usuario).all()

def create_usuario(db: Session, data: UsuarioCreate):
    usuario = Usuario(
        nombre     = data.nombre,
        correo     = data.correo,
        contrasena = hash_password(data.contrasena),
        rol        = data.rol or "usuario"
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario

def update_usuario(db: Session, id: int, data: UsuarioUpdate):
    usuario = get_usuario(db, id)
    if not usuario:
        return None
    if data.nombre:     usuario.nombre     = data.nombre
    if data.correo:     usuario.correo     = data.correo
    if data.contrasena: usuario.contrasena = hash_password(data.contrasena)
    if data.rol:        usuario.rol        = data.rol
    db.commit()
    db.refresh(usuario)
    return usuario

def delete_usuario(db: Session, id: int):
    usuario = get_usuario(db, id)
    if usuario:
        db.delete(usuario)
        db.commit()
    return usuario