from datetime import datetime
import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.super_admin import SuperAdmin
from app.models.empresa import Empresa
from app.models.corretor import Corretor
from app.core.security import verify_password, create_access_token, hash_password
from app.schemas.super_admin import SuperAdminCreate, SuperAdminLogin, SuperAdminResponse

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])


def _to_bool(value):
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "sim", "yes", "on"}


def salvar_logo(logo):
    if not logo:
        return None

    pasta = "uploads/logos"
    os.makedirs(pasta, exist_ok=True)

    extensao = os.path.splitext(logo.filename or "")[1] or ".png"
    nome_arquivo = f"{uuid4().hex}{extensao}"
    caminho = os.path.join(pasta, nome_arquivo)

    with open(caminho, "wb") as buffer:
        shutil.copyfileobj(logo.file, buffer)

    return f"/{caminho.replace(os.sep, '/')}"


@router.post("/registrar", response_model=SuperAdminResponse)
def registrar_super_admin(payload: SuperAdminCreate, db: Session = Depends(get_db)):
    existente = db.query(SuperAdmin).filter(SuperAdmin.email == payload.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    dados = payload.model_dump()
    dados["senha"] = hash_password(dados["senha"])

    novo = SuperAdmin(**dados)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router.post("/login")
def login_super_admin(payload: SuperAdminLogin, db: Session = Depends(get_db)):
    user = db.query(SuperAdmin).filter(SuperAdmin.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    senha_salva = str(user.senha or "")

    if not senha_salva.startswith("$2"):
        if payload.senha != senha_salva:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")

        user.senha = hash_password(payload.senha)
        db.commit()
        db.refresh(user)
    else:
        if not verify_password(payload.senha, senha_salva):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_access_token({
        "sub": str(user.id),
        "tipo": "super_admin"
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/empresas-com-admin")
def criar_empresa_com_admin(
    nome: str = Form(...),
    cnpj: str = Form(""),
    email: str = Form(...),
    telefone: str = Form(""),
    licenca: str = Form(""),
    limite_usuarios: int = Form(5),
    ativa: str = Form("true"),
    vencimento: str = Form(""),
    admin_nome: str = Form(...),
    admin_email: str = Form(...),
    admin_telefone: str = Form(""),
    admin_creci: str = Form(...),
    admin_senha: str = Form(...),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    empresa_existente = db.query(Empresa).filter(Empresa.email == email).first()
    if empresa_existente:
        raise HTTPException(status_code=400, detail="Já existe uma empresa com esse email")

    corretor_email_existente = db.query(Corretor).filter(Corretor.email == admin_email).first()
    if corretor_email_existente:
        raise HTTPException(status_code=400, detail="Já existe um corretor com esse email")

    corretor_creci_existente = db.query(Corretor).filter(Corretor.creci == admin_creci).first()
    if corretor_creci_existente:
        raise HTTPException(status_code=400, detail="Já existe um corretor com esse CRECI")

    vencimento_convertido = None
    if vencimento:
        try:
            vencimento_convertido = datetime.strptime(vencimento, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Data de vencimento inválida")

    logo_url = salvar_logo(logo)

    empresa = Empresa(
        nome=nome,
        cnpj=cnpj or None,
        email=email,
        telefone=telefone or None,
        licenca=licenca or None,
        limite_usuarios=limite_usuarios,
        ativa=_to_bool(ativa),
        vencimento=vencimento_convertido,
        logo_url=logo_url,
    )
    db.add(empresa)
    db.flush()

    corretor_admin = Corretor(
        nome=admin_nome,
        email=admin_email,
        telefone=admin_telefone or None,
        creci=admin_creci,
        senha=hash_password(admin_senha),
        ativo=True,
        perfil="admin",
        empresa_id=empresa.id,
    )
    db.add(corretor_admin)

    db.commit()
    db.refresh(empresa)

    return {
        "message": "Empresa e primeiro administrador criados com sucesso",
        "empresa_id": empresa.id,
        "corretor_admin_id": corretor_admin.id,
    }