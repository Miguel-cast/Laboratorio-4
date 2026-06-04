from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.reserva import ReservaCreate, ReservaUpdate, ReservaResponse
from app.crud.reserva import get_reservas, get_reserva, create_reserva, update_reserva, update_estado_reserva, delete_reserva
from app.auth.jwt import get_current_user, require_admin
from app.models.usuario import Usuario
from typing import List

router = APIRouter(prefix="/reservas", tags=["Reservas"])

@router.post("/", response_model=ReservaResponse, status_code=201)
def crear(data: ReservaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    reserva = create_reserva(db, data, usuario.id_usuario)
    return reserva

@router.get("/", response_model=List[ReservaResponse])
def listar(db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    if usuario.rol == "admin":
        return get_reservas(db)
    return get_reservas(db, id_usuario=usuario.id_usuario)

@router.get("/{id}", response_model=ReservaResponse)
def obtener(id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    r = get_reserva(db, id)
    if not r:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if usuario.rol != "admin" and r.id_usuario != usuario.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta reserva")
    return r

@router.put("/{id}/estado", response_model=ReservaResponse)
def cambiar_estado(id: int, data: ReservaUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return update_estado_reserva(db, id, data.estado)

@router.put("/{id}", response_model=ReservaResponse)
def editar(id: int, data: ReservaCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    return update_reserva(db, id, data)

@router.delete("/{id}")
def cancelar(id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    delete_reserva(db, id, usuario.id_usuario, usuario.rol)
    return {"mensaje": "Reserva cancelada correctamente"}