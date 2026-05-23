from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.reserva import Reserva
from app.models.espacio import Espacio
from app.schemas.reserva import ReservaCreate
from fastapi import HTTPException, status
from datetime import datetime, date, time, timedelta

ESTADOS_BLOQUEAN = ["esperando", "aprobada"]

def validar_reglas(db: Session, data: ReservaCreate, id_usuario: int):
    # F: hora_inicio < hora_fin
    if data.hora_inicio >= data.hora_fin:
        raise HTTPException(status_code=400, detail="La hora de inicio debe ser menor que la hora de fin")

    # D: anticipación mínima 24 horas
    inicio_dt = datetime.combine(data.fecha, data.hora_inicio)
    if inicio_dt - datetime.now() < timedelta(hours=24):
        raise HTTPException(status_code=400, detail="La reserva debe realizarse con al menos 24 horas de anticipación")

    # E: horario permitido
    dia_semana = data.fecha.weekday()  # 0=lunes, 6=domingo
    if dia_semana == 6:
        raise HTTPException(status_code=400, detail="No se permiten reservas los domingos")
    if dia_semana == 5:  # sábado
        if data.hora_inicio < time(8, 0) or data.hora_fin > time(12, 0):
            raise HTTPException(status_code=400, detail="Los sábados el horario permitido es 8:00 a.m. – 12:00 m.")
    else:  # lunes a viernes
        if data.hora_inicio < time(7, 0) or data.hora_fin > time(20, 0):
            raise HTTPException(status_code=400, detail="El horario permitido es Lunes–Viernes 7:00 a.m. – 8:00 p.m.")

    # G: espacio activo
    espacio = db.query(Espacio).filter(Espacio.id_espacio == data.id_espacio).first()
    if not espacio:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    if espacio.estado != "activo":
        raise HTTPException(status_code=400, detail=f"El espacio no está disponible (estado: {espacio.estado})")

    # H: capacidad
    if data.cantidad_asistentes > espacio.capacidad:
        raise HTTPException(status_code=400, detail=f"La cantidad de asistentes supera la capacidad del espacio ({espacio.capacidad})")

    # C: sin superposición
    conflicto = db.query(Reserva).filter(
        and_(
            Reserva.id_espacio == data.id_espacio,
            Reserva.fecha      == data.fecha,
            Reserva.estado.in_(ESTADOS_BLOQUEAN),
            Reserva.hora_inicio < data.hora_fin,
            Reserva.hora_fin    > data.hora_inicio,
        )
    ).first()
    if conflicto:
        raise HTTPException(status_code=400, detail="El espacio ya tiene una reserva activa en ese horario y fecha")

def get_reserva(db: Session, id: int):
    return db.query(Reserva).filter(Reserva.id_reserva == id).first()

def get_reservas(db: Session, id_usuario: int = None):
    q = db.query(Reserva)
    if id_usuario:
        q = q.filter(Reserva.id_usuario == id_usuario)
    return q.all()

def create_reserva(db: Session, data: ReservaCreate, id_usuario: int):
    validar_reglas(db, data, id_usuario)
    reserva = Reserva(
        id_usuario          = id_usuario,
        id_espacio          = data.id_espacio,
        fecha               = data.fecha,
        hora_inicio         = data.hora_inicio,
        hora_fin            = data.hora_fin,
        cantidad_asistentes = data.cantidad_asistentes,
        estado              = "esperando"
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva

def update_estado_reserva(db: Session, id: int, nuevo_estado: str):
    if nuevo_estado not in ["aprobada", "rechazada"]:
        raise HTTPException(status_code=400, detail="Estado no válido. Use 'aprobada' o 'rechazada'")
    reserva = get_reserva(db, id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    reserva.estado = nuevo_estado
    db.commit()
    db.refresh(reserva)
    return reserva

def delete_reserva(db: Session, id: int, id_usuario: int, rol: str):
    reserva = get_reserva(db, id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if rol != "admin" and reserva.id_usuario != id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para cancelar esta reserva")
    db.delete(reserva)
    db.commit()
    return reserva