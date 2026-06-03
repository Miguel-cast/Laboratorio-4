from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre     = Column(String, nullable=False)
    correo     = Column(String, unique=True, nullable=False, index=True)
    contrasena = Column(String, nullable=False)
    rol        = Column(String, nullable=False, default="usuario")

    reservas = relationship("Reserva", back_populates="usuario")