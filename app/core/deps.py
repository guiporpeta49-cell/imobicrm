from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import get_db
from app.models.corretor import Corretor
from app.models.super_admin import SuperAdmin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
super_admin_scheme = OAuth2PasswordBearer(tokenUrl="/super-admin/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(token)

    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(Corretor).filter(Corretor.id == int(payload["sub"])).first()

    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")

    return user

def require_admin(user: Corretor = Depends(get_current_user)):
    if user.perfil != "admin":
        raise HTTPException(status_code=403, detail="Sem permissão")
    return user

def get_current_super_admin(
    token: str = Depends(super_admin_scheme),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(token)

    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Not authenticated")

    super_admin = db.query(SuperAdmin).filter(SuperAdmin.id == int(payload["sub"])).first()

    if not super_admin:
        raise HTTPException(status_code=401, detail="Super admin não encontrado")

    return super_admin
