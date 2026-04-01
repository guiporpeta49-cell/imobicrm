from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Enum, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Negociacao(Base):
    __tablename__ = "negociacoes"

    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    imovel_id = Column(Integer, ForeignKey("imoveis.id"), nullable=False)
    corretor_id = Column(Integer, ForeignKey("corretores.id"), nullable=False)

    valor_imovel = Column(DECIMAL(12, 2), nullable=False)
    valor_negociado = Column(DECIMAL(12, 2), nullable=False)
    percentual_lucro = Column(DECIMAL(5, 2), nullable=False, default=0)
    valor_lucro = Column(DECIMAL(12, 2), nullable=False)

    status = Column(
        Enum("em_negociacao", "fechada", "cancelada", name="status_negociacao"),
        nullable=False,
        default="em_negociacao"
    )

    criado_em = Column(DateTime, server_default=func.now(), nullable=False)

    empresa = relationship("Empresa")
    cliente = relationship("Cliente")
    imovel = relationship("Imovel")
    corretor = relationship("Corretor")
