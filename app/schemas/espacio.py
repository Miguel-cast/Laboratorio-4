from pydantic import BaseModel
from typing import Optional

class EspacioCreate(BaseModel):
    nombre:    str
    ubicacion: str
    capacidad: int
    estado:    Optional[str] = "activo"

class EspacioUpdate(BaseModel):
    nombre:    Optional[str] = None
    ubicacion: Optional[str] = None
    capacidad: Optional[int] = None
    estado:    Optional[str] = None

class EspacioResponse(BaseModel):
    id_espacio: int
    nombre:     str
    ubicacion:  str
    capacidad:  int
    estado:     str

    class Config:
        from_attributes = True