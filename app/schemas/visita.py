from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VisitaCreate(BaseModel):
    cliente_id: int
    data_visita: datetime
    observacoes: Optional[str] = None
    status: str = "agendada"
    tipo: str = "visita"
    imovel_id: Optional[int] = None


class VisitaResponse(VisitaCreate):
    id: int
    empresa_id: int
    corretor_id: int

    class Config:
        from_attributes = True