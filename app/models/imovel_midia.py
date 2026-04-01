from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class ImovelMidia(Base):
    __tablename__ = "imovel_midias"

    id = Column(Integer, primary_key=True, index=True)
    imovel_id = Column(Integer, ForeignKey("imoveis.id"), nullable=False)
    tipo = Column(String(20), nullable=False)  # foto ou video
    arquivo_url = Column(String(255), nullable=False)
    nome_arquivo = Column(String(255), nullable=False)

    imovel = relationship("Imovel")