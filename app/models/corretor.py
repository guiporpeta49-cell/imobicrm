from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class Corretor(Base):
    __tablename__ = "corretores"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    telefone = Column(String(20), nullable=True)
    creci = Column(String(30), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True)
    perfil = Column(
    Enum("admin", "corretor", "atendente", name="perfil_corretor"),
    nullable=False,
    default="corretor"
    )

    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    empresa = relationship("Empresa")
