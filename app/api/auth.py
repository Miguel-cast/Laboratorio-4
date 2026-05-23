from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.crud.usuario import create_usuario, get_usuario_by_correo, verify_password
from app.auth.jwt import crear_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = get_usuario_by_correo(db, form.username)
    if not usuario or not verify_password(form.password, usuario.contrasena):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    token = crear_token({"sub": usuario.correo, "rol": usuario.rol, "id": usuario.id_usuario})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/register", response_model=UsuarioResponse, status_code=201)
def register(data: UsuarioCreate, db: Session = Depends(get_db)):
    if get_usuario_by_correo(db, data.correo):
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    data.rol = "usuario"
    usuario = create_usuario(db, data)
    return usuario