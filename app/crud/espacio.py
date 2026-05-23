from sqlalchemy.orm import Session
from app.models.espacio import Espacio
from app.schemas.espacio import EspacioCreate, EspacioUpdate

def get_espacio(db: Session, id: int):
    return db.query(Espacio).filter(Espacio.id_espacio == id).first()

def get_espacios(db: Session):
    return db.query(Espacio).all()

def create_espacio(db: Session, data: EspacioCreate):
    espacio = Espacio(**data.model_dump())
    db.add(espacio)
    db.commit()
    db.refresh(espacio)
    return espacio

def update_espacio(db: Session, id: int, data: EspacioUpdate):
    espacio = get_espacio(db, id)
    if not espacio:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(espacio, field, value)
    db.commit()
    db.refresh(espacio)
    return espacio

def delete_espacio(db: Session, id: int):
    espacio = get_espacio(db, id)
    if espacio:
        db.delete(espacio)
        db.commit()
    return espacio