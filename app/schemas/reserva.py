from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class ReservaCreate(BaseModel):
    id_espacio:          int
    fecha:               date
    hora_inicio:         time
    hora_fin:            time
    cantidad_asistentes: int

class ReservaUpdate(BaseModel):
    estado: str

class ReservaResponse(BaseModel):
    id_reserva:          int
    id_usuario:          int
    id_espacio:          int
    fecha:               date
    hora_inicio:         time
    hora_fin:            time
    cantidad_asistentes: int
    estado:              str

    class Config:
        from_attributes = True