# app/core/permissions.py

from fastapi import HTTPException

def require_perfil(user, perfis_permitidos: list):
    if user.perfil not in perfis_permitidos:
        raise HTTPException(status_code=403, detail="Sem permissão")