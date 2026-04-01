from pydantic import BaseModel, EmailStr


class SuperAdminCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    ativo: bool = True


class SuperAdminLogin(BaseModel):
    email: EmailStr
    senha: str


class SuperAdminResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    ativo: bool

    class Config:
        from_attributes = True