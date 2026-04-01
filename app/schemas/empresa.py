from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


class EmpresaCreate(BaseModel):
    nome: str
    cnpj: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    logo_url: Optional[str] = None
    licenca: str = "basica"
    limite_usuarios: int = 1
    ativa: bool = True
    vencimento: Optional[date] = None


class EmpresaResponse(EmpresaCreate):
    id: int

    class Config:
        from_attributes = True