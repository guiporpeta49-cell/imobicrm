import os
from sqlalchemy import text
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import (
    super_admin,
    empresas,
    auth,
    corretores,
    clientes,
    imoveis,
    imoveis_publico,
    imovel_midias,
    visitas,
    propostas,
    negociacoes,
    imovel_pdf,
)

from app.models.super_admin import SuperAdmin
from app.models.empresa import Empresa
from app.models.corretor import Corretor
from app.models.cliente import Cliente
from app.models.imovel import Imovel
from app.models.imovel_midia import ImovelMidia
from app.models.visita import Visita
from app.models.proposta import Proposta
from app.models.negociacao import Negociacao

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def ensure_public_columns():
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE imoveis ADD COLUMN public_token VARCHAR(64) NULL"))
    except Exception:
        pass

    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE imoveis ADD COLUMN publicado BOOLEAN NOT NULL DEFAULT TRUE"))
    except Exception:
        pass


ensure_public_columns()

os.makedirs("uploads/logos", exist_ok=True)
os.makedirs("uploads/imoveis", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(super_admin.router)
app.include_router(empresas.router)
app.include_router(auth.router)
app.include_router(corretores.router)
app.include_router(clientes.router)
app.include_router(imoveis.router)
app.include_router(imoveis_publico.router)
app.include_router(imovel_midias.router)
app.include_router(visitas.router)
app.include_router(propostas.router)
app.include_router(negociacoes.router)
app.include_router(imovel_pdf.router)


@app.get("/")
def home():
    return {"mensagem": "API do sistema imobiliário no ar"}