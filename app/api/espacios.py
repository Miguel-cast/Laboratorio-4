from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.espacio import EspacioCreate, EspacioUpdate, EspacioResponse
from app.crud.espacio import get_espacios, get_espacio, create_espacio, update_espacio, delete_espacio
from app.auth.jwt import get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/espacios", tags=["Espacios"])

@router.post("/", response_model=EspacioResponse, status_code=201)
def crear(data: EspacioCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return create_espacio(db, data)

@router.get("/", response_model=List[EspacioResponse])
def listar(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_espacios(db)

@router.get("/{id}", response_model=EspacioResponse)
def obtener(id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    e = get_espacio(db, id)
    if not e:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return e

@router.put("/{id}", response_model=EspacioResponse)
def actualizar(id: int, data: EspacioUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    e = update_espacio(db, id, data)
    if not e:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return e

@router.delete("/{id}")
def eliminar(id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    e = delete_espacio(db, id)
    if not e:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return {"mensaje": "Espacio eliminado correctamente"}