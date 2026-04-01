from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base


class SuperAdmin(Base):
    __tablename__ = "super_admins"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)