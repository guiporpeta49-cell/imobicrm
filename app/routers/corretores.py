from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.core.security import hash_password
from app.database import get_db
from app.models.corretor import Corretor
from app.schemas.corretor import CorretorCreate, CorretorResponse

router = APIRouter(prefix="/corretores", tags=["Corretores"])


@router.post("/", response_model=CorretorResponse)
def criar_corretor(
    corretor: CorretorCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(require_admin),
):
    email_existente = (
        db.query(Corretor)
        .filter(Corretor.email == corretor.email, Corretor.empresa_id == user.empresa_id)
        .first()
    )
    if email_existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    creci_existente = (
        db.query(Corretor)
        .filter(Corretor.creci == corretor.creci, Corretor.empresa_id == user.empresa_id)
        .first()
    )
    if creci_existente:
        raise HTTPException(status_code=400, detail="CRECI já cadastrado")

    dados = corretor.model_dump()

    if dados.get("perfil") not in ["admin", "corretor", "atendente"]:
        dados["perfil"] = "corretor"

    dados["senha"] = hash_password(dados["senha"])
    dados["empresa_id"] = user.empresa_id

    novo_corretor = Corretor(**dados)
    db.add(novo_corretor)
    db.commit()
    db.refresh(novo_corretor)
    return novo_corretor


@router.get("/", response_model=list[CorretorResponse])
def listar_corretores(
    db: Session = Depends(get_db),
    user: Corretor = Depends(require_admin),
):
    return (
        db.query(Corretor)
        .filter(Corretor.empresa_id == user.empresa_id)
        .all()
    )


@router.get("/{corretor_id}", response_model=CorretorResponse)
def buscar_corretor(
    corretor_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(require_admin),
):
    corretor = (
        db.query(Corretor)
        .filter(Corretor.id == corretor_id, Corretor.empresa_id == user.empresa_id)
        .first()
    )
    if not corretor:
        raise HTTPException(status_code=404, detail="Corretor não encontrado")
    return corretor


@router.put("/{corretor_id}", response_model=CorretorResponse)
def atualizar_corretor(
    corretor_id: int,
    dados: CorretorCreate,
    db: Session = Depends(get_db),
    user: Corretor = Depends(require_admin),
):
    corretor = (
        db.query(Corretor)
        .filter(Corretor.id == corretor_id, Corretor.empresa_id == user.empresa_id)
        .first()
    )
    if not corretor:
        raise HTTPException(status_code=404, detail="Corretor não encontrado")

    outro_email = (
        db.query(Corretor)
        .filter(
            Corretor.email == dados.email,
            Corretor.id != corretor_id,
            Corretor.empresa_id == user.empresa_id,
        )
        .first()
    )
    if outro_email:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    outro_creci = (
        db.query(Corretor)
        .filter(
            Corretor.creci == dados.creci,
            Corretor.id != corretor_id,
            Corretor.empresa_id == user.empresa_id,
        )
        .first()
    )
    if outro_creci:
        raise HTTPException(status_code=400, detail="CRECI já cadastrado")

    payload = dados.model_dump()

    if payload.get("perfil") not in ["admin", "corretor", "atendente"]:
        payload["perfil"] = "corretor"

    # Só troca a senha se vier preenchida
    if payload.get("senha"):
        payload["senha"] = hash_password(payload["senha"])
    else:
        payload.pop("senha", None)

    for campo, valor in payload.items():
        setattr(corretor, campo, valor)

    db.commit()
    db.refresh(corretor)
    return corretor


@router.delete("/{corretor_id}")
def deletar_corretor(
    corretor_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(require_admin),
):
    corretor = (
        db.query(Corretor)
        .filter(Corretor.id == corretor_id, Corretor.empresa_id == user.empresa_id)
        .first()
    )
    if not corretor:
        raise HTTPException(status_code=404, detail="Corretor não encontrado")

    if corretor.id == user.id:
        raise HTTPException(status_code=400, detail="Você não pode excluir seu próprio usuário")

    db.delete(corretor)
    db.commit()
    return {"mensagem": "Corretor removido com sucesso"}