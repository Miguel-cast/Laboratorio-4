from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from app.crud.usuario import (
    get_usuarios, get_usuario, create_usuario, update_usuario,
    delete_usuario, get_usuario_by_correo,
)
from app.auth.jwt import require_admin
from typing import List

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UsuarioResponse, status_code=201)
def crear(data: UsuarioCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if get_usuario_by_correo(db, data.correo):
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    if data.rol not in ("admin", "usuario"):
        raise HTTPException(status_code=400, detail="Rol no válido. Use 'admin' o 'usuario'")
    return create_usuario(db, data)

@router.get("/", response_model=List[UsuarioResponse])
def listar(db: Session = Depends(get_db), _=Depends(require_admin)):
    return get_usuarios(db)

@router.get("/{id}", response_model=UsuarioResponse)
def obtener(id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    u = get_usuario(db, id)
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return u

@router.put("/{id}", response_model=UsuarioResponse)
def actualizar(id: int, data: UsuarioUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    # Evita colisión de correo con otro usuario
    if data.correo:
        existente = get_usuario_by_correo(db, data.correo)
        if existente and existente.id_usuario != id:
            raise HTTPException(status_code=400, detail="El correo ya está en uso por otro usuario")
    if data.rol and data.rol not in ("admin", "usuario"):
        raise HTTPException(status_code=400, detail="Rol no válido. Use 'admin' o 'usuario'")
    u = update_usuario(db, id, data)
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return u

@router.delete("/{id}")
def eliminar(id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    u = delete_usuario(db, id)
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"mensaje": "Usuario eliminado correctamente"}
