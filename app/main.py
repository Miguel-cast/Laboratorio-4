from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, usuarios, espacios, reservas

app = FastAPI(
    title="Gestión de Reservas Institucionales",
    description="API REST para reserva de espacios institucionales con autenticación JWT",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prefix = "/api/v1"
app.include_router(auth.router,     prefix=prefix)
app.include_router(usuarios.router, prefix=prefix)
app.include_router(espacios.router, prefix=prefix)
app.include_router(reservas.router, prefix=prefix)

@app.get("/")
def root():
    return {"mensaje": "API de Reservas funcionando", "docs": "/docs"}