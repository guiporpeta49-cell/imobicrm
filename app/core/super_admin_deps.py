from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.super_admin import SuperAdmin
from app.core.security import SECRET_KEY, ALGORITHM

oauth2_scheme_super_admin = OAuth2PasswordBearer(tokenUrl="/super-admin/login")


def get_current_super_admin(
    token: str = Depends(oauth2_scheme_super_admin),
    db: Session = Depends(get_db)
) -> SuperAdmin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token de super admin inválido ou expirado",
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        tipo = payload.get("tipo")

        if user_id is None or tipo != "super_admin":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(SuperAdmin).filter(SuperAdmin.id == int(user_id)).first()

    if not user:
        raise credentials_exception

    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin inativo"
        )

    return user