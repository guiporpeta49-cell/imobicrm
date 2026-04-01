import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.imovel import Imovel
from app.models.corretor import Corretor
from app.schemas.imovel import ImovelCreate, ImovelUpdate, ImovelOut
from app.core.deps import get_current_user

router = APIRouter(prefix="/imoveis", tags=["Imóveis"])


def limpar_campos_antigos(dados: dict) -> dict:
    campos_antigos = [
        "endereco",
        "valor",
        "vagas",
        "area_hectares",
        "area_alqueires",
        "plantio_existente",
        "nome_proprietario",
        "telefone_proprietario",
    ]
    for campo in campos_antigos:
        dados.pop(campo, None)
    return dados


@router.get("/", response_model=list[ImovelOut])
def listar_imoveis(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(Imovel).filter(
        Imovel.empresa_id == user.empresa_id
    ).all()


@router.get("/{imovel_id}", response_model=ImovelOut)
def obter_imovel(
    imovel_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    imovel = db.query(Imovel).filter(
        Imovel.id == imovel_id,
        Imovel.empresa_id == user.empresa_id
    ).first()

    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    return imovel


@router.post("/", response_model=ImovelOut)
def criar_imovel(
    imovel: ImovelCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    corretor = db.query(Corretor).filter(
        Corretor.id == user.id,
        Corretor.empresa_id == user.empresa_id
    ).first()

    if not corretor:
        raise HTTPException(status_code=403, detail="Corretor não encontrado")

    dados = imovel.model_dump(exclude_unset=True)
    dados = limpar_campos_antigos(dados)

    dados["empresa_id"] = user.empresa_id
    dados["corretor_id"] = user.id

    if not dados.get("public_token"):
        dados["public_token"] = secrets.token_hex(16)

    if "publicado" not in dados:
        dados["publicado"] = True

    novo_imovel = Imovel(**dados)
    db.add(novo_imovel)
    db.commit()
    db.refresh(novo_imovel)
    return novo_imovel


@router.put("/{imovel_id}", response_model=ImovelOut)
def atualizar_imovel(
    imovel_id: int,
    imovel: ImovelUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    imovel_db = db.query(Imovel).filter(
        Imovel.id == imovel_id,
        Imovel.empresa_id == user.empresa_id
    ).first()

    if not imovel_db:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    dados = imovel.model_dump(exclude_unset=True)
    dados = limpar_campos_antigos(dados)

    dados.pop("empresa_id", None)
    dados.pop("corretor_id", None)

    for chave, valor in dados.items():
        setattr(imovel_db, chave, valor)

    db.commit()
    db.refresh(imovel_db)
    return imovel_db


@router.delete("/{imovel_id}")
def excluir_imovel(
    imovel_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    imovel = db.query(Imovel).filter(
        Imovel.id == imovel_id,
        Imovel.empresa_id == user.empresa_id
    ).first()

    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    db.delete(imovel)
    db.commit()
    return {"message": "Imóvel excluído com sucesso"}