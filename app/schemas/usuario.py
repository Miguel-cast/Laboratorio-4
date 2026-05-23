from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioCreate(BaseModel):
    nombre:     str
    correo:     EmailStr
    contrasena: str
    rol:        Optional[str] = "usuario"

class UsuarioUpdate(BaseModel):
    nombre:     Optional[str] = None
    correo:     Optional[EmailStr] = None
    contrasena: Optional[str] = None
    rol:        Optional[str] = None

class UsuarioResponse(BaseModel):
    id_usuario: int
    nombre:     str
    correo:     str
    rol:        str

    class Config:
        from_attributes = True