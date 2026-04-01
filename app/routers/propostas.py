from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.models.proposta import Proposta
from app.models.cliente import Cliente
from app.models.imovel import Imovel
from app.models.corretor import Corretor
from app.schemas.proposta import PropostaCreate, PropostaResponse

router = APIRouter(prefix="/propostas", tags=["Propostas"])


@router.post("/", response_model=PropostaResponse)
def criar_proposta(
    proposta: PropostaCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    cliente = db.query(Cliente).filter(
        Cliente.id == proposta.cliente_id,
        Cliente.empresa_id == user.empresa_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    imovel_query = db.query(Imovel).filter(
        Imovel.id == proposta.imovel_id,
        Imovel.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        imovel_query = imovel_query.filter(Imovel.corretor_id == user.id)
    imovel = imovel_query.first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    dados = proposta.model_dump()
    dados["empresa_id"] = user.empresa_id

    nova_proposta = Proposta(**dados)
    db.add(nova_proposta)
    db.commit()
    db.refresh(nova_proposta)
    return nova_proposta


@router.get("/", response_model=list[PropostaResponse])
def listar_propostas(
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Proposta).filter(Proposta.empresa_id == user.empresa_id)
    if user.perfil != "admin":
        query = query.join(Imovel, Proposta.imovel_id == Imovel.id).filter(Imovel.corretor_id == user.id)
    return query.all()


@router.get("/{proposta_id}", response_model=PropostaResponse)
def buscar_proposta(
    proposta_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Proposta).filter(Proposta.id == proposta_id, Proposta.empresa_id == user.empresa_id)
    if user.perfil != "admin":
        query = query.join(Imovel, Proposta.imovel_id == Imovel.id).filter(Imovel.corretor_id == user.id)

    proposta = query.first()
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")
    return proposta


@router.put("/{proposta_id}", response_model=PropostaResponse)
def atualizar_proposta(
    proposta_id: int,
    dados: PropostaCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Proposta).filter(Proposta.id == proposta_id, Proposta.empresa_id == user.empresa_id)
    if user.perfil != "admin":
        query = query.join(Imovel, Proposta.imovel_id == Imovel.id).filter(Imovel.corretor_id == user.id)

    proposta = query.first()
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")

    cliente = db.query(Cliente).filter(
        Cliente.id == dados.cliente_id,
        Cliente.empresa_id == user.empresa_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    imovel_query = db.query(Imovel).filter(
        Imovel.id == dados.imovel_id,
        Imovel.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        imovel_query = imovel_query.filter(Imovel.corretor_id == user.id)
    imovel = imovel_query.first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    for campo, valor in dados.model_dump().items():
        setattr(proposta, campo, valor)

    db.commit()
    db.refresh(proposta)
    return proposta


@router.delete("/{proposta_id}")
def deletar_proposta(
    proposta_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(require_admin),
):
    proposta = (
        db.query(Proposta)
        .filter(Proposta.id == proposta_id, Proposta.empresa_id == user.empresa_id)
        .first()
    )
    if not proposta:
        raise HTTPException(status_code=404, detail="Proposta não encontrada")

    db.delete(proposta)
    db.commit()
    return {"mensagem": "Proposta removida com sucesso"}
