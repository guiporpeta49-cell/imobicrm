from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.imovel import Imovel
from app.models.imovel_midia import ImovelMidia

router = APIRouter(prefix="/imoveis/publico", tags=["Imóveis Público"])


# 🔥 BUSCAR IMÓVEL PÚBLICO
@router.get("/imovel/{token}")
def get_imovel_publico(token: str, db: Session = Depends(get_db)):
    imovel = db.query(Imovel).filter(
        Imovel.public_token == token,
        Imovel.publicado == True
    ).first()

    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    return imovel


# 🔥 BUSCAR MÍDIAS DO IMÓVEL
@router.get("/imovel/{token}/midias")
def get_midias_imovel(token: str, db: Session = Depends(get_db)):
    imovel = db.query(Imovel).filter(
        Imovel.public_token == token
    ).first()

    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    midias = db.query(ImovelMidia).filter(
        ImovelMidia.imovel_id == imovel.id
    ).all()

    return midias