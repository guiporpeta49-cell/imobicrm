from pydantic import BaseModel, EmailStr
from typing import Optional


class ClienteCreate(BaseModel):
    nome: str
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    interesse: str
    faixa_preco: Optional[float] = None


class ClienteResponse(ClienteCreate):
    id: int
    empresa_id: int

    class Config:
        from_attributes = True
