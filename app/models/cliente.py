from sqlalchemy import Column, Integer, String, DECIMAL, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    telefone = Column(String(20), nullable=True)
    interesse = Column(Enum("compra", "aluguel", name="interesse_cliente"), nullable=False)
    faixa_preco = Column(DECIMAL(12, 2), nullable=True)

    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    empresa = relationship("Empresa")
