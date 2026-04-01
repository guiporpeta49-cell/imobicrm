from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Enum, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Proposta(Base):
    __tablename__ = "propostas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    imovel_id = Column(Integer, ForeignKey("imoveis.id"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    valor_ofertado = Column(DECIMAL(12, 2), nullable=False)
    status = Column(Enum("pendente", "aceita", "recusada", name="status_proposta"), default="pendente", nullable=False)
    criado_em = Column(DateTime, server_default=func.now(), nullable=False)

    cliente = relationship("Cliente")
    imovel = relationship("Imovel")
    empresa = relationship("Empresa")
