import os
import shutil
from uuid import uuid4
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.deps import get_current_super_admin
from app.database import get_db
from app.models.empresa import Empresa

router = APIRouter(prefix="/empresas", tags=["Empresas"])

UPLOAD_DIR = "uploads/logos"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def salvar_logo(logo: UploadFile | None):
    if not logo:
        return None

    extensao = os.path.splitext(logo.filename)[1].lower()
    nome_arquivo = f"{uuid4().hex}{extensao}"
    caminho_fisico = os.path.join(UPLOAD_DIR, nome_arquivo)

    with open(caminho_fisico, "wb") as buffer:
        shutil.copyfileobj(logo.file, buffer)

    return f"/uploads/logos/{nome_arquivo}"


@router.post("/")
def criar_empresa(
    nome: str = Form(...),
    cnpj: str = Form(None),
    email: str = Form(...),
    telefone: str = Form(None),
    licenca: str = Form(None),
    limite_usuarios: int = Form(5),
    ativa: bool = Form(True),
    vencimento: date | None = Form(None),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_super_admin),
):
    existe = db.query(Empresa).filter(Empresa.email == email).first()
    if existe:
        raise HTTPException(status_code=400, detail="Já existe empresa com esse email")

    logo_url = salvar_logo(logo)

    empresa = Empresa(
        nome=nome,
        cnpj=cnpj,
        email=email,
        telefone=telefone,
        licenca=licenca,
        limite_usuarios=limite_usuarios,
        ativa=ativa,
        vencimento=vencimento,
        logo_url=logo_url,
    )

    db.add(empresa)
    db.commit()
    db.refresh(empresa)
    return empresa


@router.get("/")
def listar_empresas(
    db: Session = Depends(get_db),
    user=Depends(get_current_super_admin),
):
    return db.query(Empresa).order_by(Empresa.id.desc()).all()


@router.put("/{empresa_id}")
def atualizar_empresa(
    empresa_id: int,
    nome: str = Form(...),
    cnpj: str = Form(None),
    email: str = Form(...),
    telefone: str = Form(None),
    licenca: str = Form(None),
    limite_usuarios: int = Form(5),
    ativa: bool = Form(True),
    vencimento: date | None = Form(None),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_super_admin),
):
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    empresa.nome = nome
    empresa.cnpj = cnpj
    empresa.email = email
    empresa.telefone = telefone
    empresa.licenca = licenca
    empresa.limite_usuarios = limite_usuarios
    empresa.ativa = ativa
    empresa.vencimento = vencimento

    if logo:
        empresa.logo_url = salvar_logo(logo)

    db.commit()
    db.refresh(empresa)
    return empresa