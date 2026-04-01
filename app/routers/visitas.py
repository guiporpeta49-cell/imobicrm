from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.cliente import Cliente
from app.models.corretor import Corretor
from app.models.imovel import Imovel
from app.models.visita import Visita
from app.schemas.visita import VisitaCreate, VisitaResponse

router = APIRouter(prefix="/visitas", tags=["Visitas"])


def validar_payload_visita(payload: VisitaCreate):
    if payload.tipo not in ["visita", "reuniao"]:
        raise HTTPException(status_code=400, detail="Tipo inválido")

    if payload.tipo == "visita" and not payload.imovel_id:
        raise HTTPException(status_code=400, detail="Imóvel é obrigatório para visita")


@router.post("/", response_model=VisitaResponse)
def criar_visita(
    payload: VisitaCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    validar_payload_visita(payload)

    cliente = db.query(Cliente).filter(
        Cliente.id == payload.cliente_id,
        Cliente.empresa_id == user.empresa_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    if payload.tipo == "reuniao":
        payload.imovel_id = None

    if payload.tipo == "visita":
        imovel_query = db.query(Imovel).filter(
            Imovel.id == payload.imovel_id,
            Imovel.empresa_id == user.empresa_id
        )
        if user.perfil != "admin":
            imovel_query = imovel_query.filter(Imovel.corretor_id == user.id)
        imovel = imovel_query.first()
        if not imovel:
            raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    nova = Visita(
        tipo=payload.tipo,
        data_visita=payload.data_visita,
        status=payload.status,
        observacoes=payload.observacoes,
        empresa_id=user.empresa_id,
        cliente_id=payload.cliente_id,
        imovel_id=payload.imovel_id if payload.tipo == "visita" else None,
        corretor_id=user.id,
    )

    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova


@router.get("/", response_model=list[VisitaResponse])
def listar_visitas(
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Visita).filter(Visita.empresa_id == user.empresa_id)
    if user.perfil != "admin":
        query = query.filter(Visita.corretor_id == user.id)
    return query.order_by(Visita.data_visita.asc()).all()


@router.get("/{visita_id}", response_model=VisitaResponse)
def buscar_visita(
    visita_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Visita).filter(
        Visita.id == visita_id,
        Visita.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        query = query.filter(Visita.corretor_id == user.id)

    visita = query.first()
    if not visita:
        raise HTTPException(status_code=404, detail="Visita não encontrada")
    return visita


@router.put("/{visita_id}", response_model=VisitaResponse)
def atualizar_visita(
    visita_id: int,
    payload: VisitaCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    validar_payload_visita(payload)

    query = db.query(Visita).filter(
        Visita.id == visita_id,
        Visita.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        query = query.filter(Visita.corretor_id == user.id)

    visita = query.first()
    if not visita:
        raise HTTPException(status_code=404, detail="Visita não encontrada")

    cliente = db.query(Cliente).filter(
        Cliente.id == payload.cliente_id,
        Cliente.empresa_id == user.empresa_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    if payload.tipo == "reuniao":
        payload.imovel_id = None

    if payload.tipo == "visita":
        imovel_query = db.query(Imovel).filter(
            Imovel.id == payload.imovel_id,
            Imovel.empresa_id == user.empresa_id
        )
        if user.perfil != "admin":
            imovel_query = imovel_query.filter(Imovel.corretor_id == user.id)
        imovel = imovel_query.first()
        if not imovel:
            raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    visita.tipo = payload.tipo
    visita.data_visita = payload.data_visita
    visita.status = payload.status
    visita.observacoes = payload.observacoes
    visita.cliente_id = payload.cliente_id
    visita.imovel_id = payload.imovel_id if payload.tipo == "visita" else None

    db.commit()
    db.refresh(visita)
    return visita


@router.delete("/{visita_id}")
def deletar_visita(
    visita_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    query = db.query(Visita).filter(
        Visita.id == visita_id,
        Visita.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        query = query.filter(Visita.corretor_id == user.id)

    visita = query.first()
    if not visita:
        raise HTTPException(status_code=404, detail="Visita não encontrada")

    db.delete(visita)
    db.commit()
    return {"mensagem": "Compromisso removido com sucesso"}
