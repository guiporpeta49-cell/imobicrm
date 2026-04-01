from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.corretor import Corretor
from app.models.empresa import Empresa
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token, hash_password

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    corretor = db.query(Corretor).filter(Corretor.email == payload.email).first()

    if not corretor:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    senha_salva = str(corretor.senha or "")

    # senha antiga salva em texto puro
    if not senha_salva.startswith("$2"):
        if payload.senha != senha_salva:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")

        # converte automaticamente para hash no primeiro login
        corretor.senha = hash_password(payload.senha)
        db.commit()
        db.refresh(corretor)

    else:
        # senha já está em hash
        if not verify_password(payload.senha, senha_salva):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")

    empresa = db.query(Empresa).filter(Empresa.id == corretor.empresa_id).first()

    token = create_access_token({
        "sub": str(corretor.id),
        "empresa_id": corretor.empresa_id,
        "perfil": corretor.perfil,
        "nome": corretor.nome,
        "email": corretor.email,
        "empresa_nome": empresa.nome if empresa else "Empresa",
        "empresa_logo": empresa.logo_url if empresa else None,
    })

    return {"access_token": token, "token_type": "bearer"}