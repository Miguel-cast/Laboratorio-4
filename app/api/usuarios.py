from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.usuario import UsuarioUpdate, UsuarioResponse
from app.crud.usuario import get_usuarios, get_usuario, update_usuario, delete_usuario
from app.auth.jwt import require_admin
from typing import List

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

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