from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database import get_db
from app.models.cliente import Cliente
from app.models.corretor import Corretor
from app.schemas.cliente import ClienteCreate, ClienteResponse

router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.post("/", response_model=ClienteResponse)
def criar_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    if cliente.email:
        email_existente = db.query(Cliente).filter(Cliente.email == cliente.email).first()
        if email_existente:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

    dados = cliente.model_dump()
    dados["empresa_id"] = user.empresa_id

    novo_cliente = Cliente(**dados)
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente


@router.get("/", response_model=list[ClienteResponse])
def listar_clientes(
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    return db.query(Cliente).filter(Cliente.empresa_id == user.empresa_id).all()


@router.get("/{cliente_id}", response_model=ClienteResponse)
def buscar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    cliente = (
        db.query(Cliente)
        .filter(Cliente.id == cliente_id, Cliente.empresa_id == user.empresa_id)
        .first()
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente


@router.put("/{cliente_id}", response_model=ClienteResponse)
def atualizar_cliente(
    cliente_id: int,
    dados: ClienteCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    cliente = (
        db.query(Cliente)
        .filter(Cliente.id == cliente_id, Cliente.empresa_id == user.empresa_id)
        .first()
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    if dados.email:
        outro_email = (
            db.query(Cliente)
            .filter(Cliente.email == dados.email, Cliente.id != cliente_id)
            .first()
        )
        if outro_email:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

    for campo, valor in dados.model_dump().items():
        setattr(cliente, campo, valor)

    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{cliente_id}")
def deletar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(require_admin),
):
    cliente = (
        db.query(Cliente)
        .filter(Cliente.id == cliente_id, Cliente.empresa_id == user.empresa_id)
        .first()
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    db.delete(cliente)
    db.commit()
    return {"mensagem": "Cliente removido com sucesso"}
