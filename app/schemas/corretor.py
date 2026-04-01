from pydantic import BaseModel, EmailStr
from typing import Optional


class CorretorCreate(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    creci: str
    senha: str
    ativo: bool = True
    perfil: str = "corretor"


class CorretorAdminCreate(CorretorCreate):
    empresa_id: int


class CorretorResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    creci: str
    ativo: bool
    perfil: str
    empresa_id: int

    class Config:
        from_attributes = True
