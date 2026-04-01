from sqlalchemy import Column, Integer, String, Boolean, Date
from app.database import Base


class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(30), nullable=True)
    email = Column(String(255), nullable=False, unique=True)
    telefone = Column(String(30), nullable=True)
    logo_url = Column(String(255), nullable=True)
    licenca = Column(String(50), nullable=True)
    limite_usuarios = Column(Integer, nullable=True, default=5)
    ativa = Column(Boolean, default=True)
    vencimento = Column(Date, nullable=True)