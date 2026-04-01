from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Visita(Base):
    __tablename__ = "visitas"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20), nullable=False, default="visita")
    data_visita = Column(DateTime, nullable=False)
    status = Column(String(30), nullable=False, default="agendada")
    observacoes = Column(Text, nullable=True)

    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    imovel_id = Column(Integer, ForeignKey("imoveis.id"), nullable=True)
    corretor_id = Column(Integer, ForeignKey("corretores.id"), nullable=False)

    cliente = relationship("Cliente")
    imovel = relationship("Imovel")
    corretor = relationship("Corretor")
