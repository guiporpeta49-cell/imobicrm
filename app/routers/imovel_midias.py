import os
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.corretor import Corretor
from app.models.imovel import Imovel
from app.models.imovel_midia import ImovelMidia
from app.schemas.imovel_midia import ImovelMidiaResponse

router = APIRouter(prefix="/imoveis", tags=["Imóveis - Mídias"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads" / "imoveis"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)



def detectar_tipo(content_type: str) -> str:
    if content_type.startswith("image/"):
        return "foto"
    if content_type.startswith("video/"):
        return "video"
    raise HTTPException(status_code=400, detail="Arquivo deve ser imagem ou vídeo")


@router.post("/{imovel_id}/midias", response_model=ImovelMidiaResponse)
def upload_midia_imovel(
    imovel_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Imovel).filter(
        Imovel.id == imovel_id,
        Imovel.empresa_id == user.empresa_id
    )

    if user.perfil != "admin":
        query = query.filter(Imovel.corretor_id == user.id)

    imovel = query.first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    tipo = detectar_tipo(arquivo.content_type or "")

    extensao = os.path.splitext(arquivo.filename or "")[1]
    nome_unico = f"{uuid.uuid4().hex}{extensao}"
    caminho_arquivo = UPLOAD_DIR / nome_unico


    with open(caminho_arquivo, "wb") as buffer:
         shutil.copyfileobj(arquivo.file, buffer)

    url = f"/uploads/imoveis/{nome_unico}"

    nova_midia = ImovelMidia(
        imovel_id=imovel_id,
        tipo=tipo,
        arquivo_url=url,
        nome_arquivo=arquivo.filename or nome_unico,
    )

    db.add(nova_midia)
    db.commit()
    db.refresh(nova_midia)

    return nova_midia


@router.get("/{imovel_id}/midias", response_model=list[ImovelMidiaResponse])
def listar_midias_imovel(
    imovel_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Imovel).filter(
        Imovel.id == imovel_id,
        Imovel.empresa_id == user.empresa_id
    )

    if user.perfil != "admin":
        query = query.filter(Imovel.corretor_id == user.id)

    imovel = query.first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    return db.query(ImovelMidia).filter(ImovelMidia.imovel_id == imovel_id).all()


@router.delete("/{imovel_id}/midias/{midia_id}")
def deletar_midia_imovel(
    imovel_id: int,
    midia_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Imovel).filter(
        Imovel.id == imovel_id,
        Imovel.empresa_id == user.empresa_id
    )

    if user.perfil != "admin":
        query = query.filter(Imovel.corretor_id == user.id)

    imovel = query.first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    midia = db.query(ImovelMidia).filter(
        ImovelMidia.id == midia_id,
        ImovelMidia.imovel_id == imovel_id
    ).first()

    if not midia:
        raise HTTPException(status_code=404, detail="Mídia não encontrada")

    caminho_fisico = BASE_DIR / midia.arquivo_url.lstrip("/")
    if caminho_fisico.exists():
         caminho_fisico.unlink()

    db.delete(midia)
    db.commit()

    return {"mensagem": "Mídia removida com sucesso"}