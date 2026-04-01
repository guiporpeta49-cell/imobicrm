from pydantic import BaseModel
from datetime import datetime


class NegociacaoCreate(BaseModel):
    cliente_id: int
    imovel_id: int
    valor_negociado: float
    percentual_lucro: float
    status: str = "em_negociacao"


class NegociacaoResponse(BaseModel):
    id: int
    empresa_id: int
    cliente_id: int
    imovel_id: int
    corretor_id: int
    valor_imovel: float
    valor_negociado: float
    percentual_lucro: float
    valor_lucro: float
    status: str
    criado_em: datetime

    class Config:
        from_attributes = True
