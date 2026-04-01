from pydantic import BaseModel


class ImovelMidiaResponse(BaseModel):
    id: int
    imovel_id: int
    tipo: str
    arquivo_url: str
    nome_arquivo: str

    class Config:
        from_attributes = True