from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.models.negociacao import Negociacao
from app.models.cliente import Cliente
from app.models.imovel import Imovel
from app.models.corretor import Corretor
from app.schemas.negociacao import NegociacaoCreate, NegociacaoResponse

router = APIRouter(prefix="/negociacoes", tags=["Negociações"])


def calcular_lucro(valor_negociado: Decimal, percentual_lucro: Decimal) -> Decimal:
    return (valor_negociado * percentual_lucro) / Decimal("100")


def bloquear_atendente(user: Corretor):
    if user.perfil == "atendente":
        raise HTTPException(status_code=403, detail="Sem permissão para acessar negociações")


def obter_valor_imovel(imovel: Imovel) -> Decimal:
    if imovel.finalidade == "aluguel":
        valor_base = imovel.valor_locacao or 0
    else:
        valor_base = imovel.valor_venda or imovel.valor_locacao or 0
    return Decimal(str(valor_base))


@router.post("/", response_model=NegociacaoResponse)
def criar_negociacao(
    payload: NegociacaoCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    bloquear_atendente(user)

    cliente = db.query(Cliente).filter(
        Cliente.id == payload.cliente_id,
        Cliente.empresa_id == user.empresa_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    imovel_query = db.query(Imovel).filter(
        Imovel.id == payload.imovel_id,
        Imovel.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        imovel_query = imovel_query.filter(Imovel.corretor_id == user.id)

    imovel = imovel_query.first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    corretor_id = imovel.corretor_id or user.id
    valor_imovel = obter_valor_imovel(imovel)
    valor_negociado = Decimal(str(payload.valor_negociado))
    percentual_lucro = Decimal(str(payload.percentual_lucro))
    valor_lucro = calcular_lucro(valor_negociado, percentual_lucro)

    nova = Negociacao(
        empresa_id=user.empresa_id,
        cliente_id=payload.cliente_id,
        imovel_id=payload.imovel_id,
        corretor_id=corretor_id,
        valor_imovel=valor_imovel,
        valor_negociado=valor_negociado,
        percentual_lucro=percentual_lucro,
        valor_lucro=valor_lucro,
        status=payload.status,
    )

    db.add(nova)
    db.commit()
    db.refresh(nova)

    if nova.status == "fechada":
        if imovel.finalidade == "venda":
            imovel.status = "vendido"
        elif imovel.finalidade == "aluguel":
            imovel.status = "alugado"
        db.commit()
        db.refresh(imovel)

    return nova


@router.get("/", response_model=list[NegociacaoResponse])
def listar_negociacoes(
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    bloquear_atendente(user)
    query = db.query(Negociacao).filter(Negociacao.empresa_id == user.empresa_id)
    if user.perfil != "admin":
        query = query.filter(Negociacao.corretor_id == user.id)
    return query.order_by(Negociacao.id.desc()).all()


@router.get("/{negociacao_id}", response_model=NegociacaoResponse)
def buscar_negociacao(
    negociacao_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    bloquear_atendente(user)
    query = db.query(Negociacao).filter(
        Negociacao.id == negociacao_id,
        Negociacao.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        query = query.filter(Negociacao.corretor_id == user.id)

    negociacao = query.first()
    if not negociacao:
        raise HTTPException(status_code=404, detail="Negociação não encontrada")
    return negociacao


@router.put("/{negociacao_id}", response_model=NegociacaoResponse)
def atualizar_negociacao(
    negociacao_id: int,
    payload: NegociacaoCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    bloquear_atendente(user)
    query = db.query(Negociacao).filter(
        Negociacao.id == negociacao_id,
        Negociacao.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        query = query.filter(Negociacao.corretor_id == user.id)

    negociacao = query.first()
    if not negociacao:
        raise HTTPException(status_code=404, detail="Negociação não encontrada")

    cliente = db.query(Cliente).filter(
        Cliente.id == payload.cliente_id,
        Cliente.empresa_id == user.empresa_id
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    imovel_query = db.query(Imovel).filter(
        Imovel.id == payload.imovel_id,
        Imovel.empresa_id == user.empresa_id
    )
    if user.perfil != "admin":
        imovel_query = imovel_query.filter(Imovel.corretor_id == user.id)

    imovel = imovel_query.first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")

    valor_imovel = obter_valor_imovel(imovel)
    valor_negociado = Decimal(str(payload.valor_negociado))
    percentual_lucro = Decimal(str(payload.percentual_lucro))
    valor_lucro = calcular_lucro(valor_negociado, percentual_lucro)

    negociacao.cliente_id = payload.cliente_id
    negociacao.imovel_id = payload.imovel_id
    negociacao.corretor_id = imovel.corretor_id or user.id
    negociacao.valor_imovel = valor_imovel
    negociacao.valor_negociado = valor_negociado
    negociacao.percentual_lucro = percentual_lucro
    negociacao.valor_lucro = valor_lucro
    negociacao.status = payload.status

    db.commit()
    db.refresh(negociacao)

    if negociacao.status == "fechada":
        if imovel.finalidade == "venda":
            imovel.status = "vendido"
        elif imovel.finalidade == "aluguel":
            imovel.status = "alugado"
        db.commit()
        db.refresh(imovel)

    return negociacao


@router.delete("/{negociacao_id}")
def deletar_negociacao(
    negociacao_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(require_admin),
):
    negociacao = db.query(Negociacao).filter(
        Negociacao.id == negociacao_id,
        Negociacao.empresa_id == user.empresa_id
    ).first()

    if not negociacao:
        raise HTTPException(status_code=404, detail="Negociação não encontrada")

    db.delete(negociacao)
    db.commit()
    return {"mensagem": "Negociação removida com sucesso"}