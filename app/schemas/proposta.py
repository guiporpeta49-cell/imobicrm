from pydantic import BaseModel
from datetime import datetime


class PropostaCreate(BaseModel):
    cliente_id: int
    imovel_id: int
    valor_ofertado: float
    status: str = "pendente"


class PropostaResponse(PropostaCreate):
    id: int
    empresa_id: int
    criado_em: datetime

    class Config:
        from_attributes = True
