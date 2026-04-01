from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date


class ImovelBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    tipo: str
    finalidade: str
    status: Optional[str] = "disponivel"

    cep: Optional[str] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    referencia_local: Optional[str] = None
    link_maps: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    nome_fazenda: Optional[str] = None
    municipio: Optional[str] = None

    proprietario_nome: Optional[str] = None
    proprietario_telefone: Optional[str] = None
    proprietario_cpf_cnpj: Optional[str] = None
    proprietario_data_nascimento: Optional[date] = None
    proprietario_email: Optional[str] = None

    valor_venda: Optional[float] = None
    valor_locacao: Optional[float] = None
    valor_iptu: Optional[float] = None
    valor_condominio: Optional[float] = None

    link_video: Optional[str] = None
    observacao_geral: Optional[str] = None

    quartos: Optional[int] = 0
    suites: Optional[int] = 0
    banheiros: Optional[int] = 0

    casa_tipo: Optional[str] = None
    sala_estar: Optional[bool] = False
    sala_jantar: Optional[bool] = False
    copa: Optional[bool] = False
    cozinha: Optional[bool] = False
    vagas_cobertas: Optional[int] = 0
    vagas_descobertas: Optional[int] = 0
    area_construida: Optional[float] = None
    area_terreno: Optional[float] = None
    area_livre: Optional[float] = None

    ap_numero: Optional[str] = None
    ap_bloco: Optional[str] = None
    ap_andar: Optional[str] = None
    tem_elevador: Optional[bool] = False
    vagas_demarcadas: Optional[bool] = False
    cond_academia: Optional[bool] = False
    cond_salao_festas: Optional[bool] = False
    cond_piscina: Optional[bool] = False
    cond_portaria_24h: Optional[bool] = False

    topografia: Optional[str] = None
    frente: Optional[float] = None
    fundo: Optional[float] = None
    lateral_esquerda: Optional[float] = None
    lateral_direita: Optional[float] = None
    zoneamento: Optional[str] = None
    possui_asfalto: Optional[bool] = False
    possui_luz: Optional[bool] = False
    possui_esgoto: Optional[bool] = False
    possui_agua_encanada: Optional[bool] = False

    distancia_asfalto_km: Optional[float] = None
    distancia_cidade_km: Optional[float] = None
    area_total_hectares: Optional[float] = None
    area_total_alqueires: Optional[float] = None
    area_agricultavel: Optional[float] = None
    area_pastagem: Optional[float] = None
    area_inaproveitavel: Optional[float] = None
    possui_rio: Optional[bool] = False
    possui_nascente: Optional[bool] = False
    possui_poco_artesiano: Optional[bool] = False
    possui_curral: Optional[bool] = False
    possui_casa_caseiro: Optional[bool] = False

    comercio_tipo: Optional[str] = None
    pe_direito: Optional[float] = None
    tipo_piso: Optional[str] = None
    vitrine: Optional[bool] = False
    banheiro_pne: Optional[bool] = False
    rampas_acesso: Optional[bool] = False
    tipo_energia: Optional[str] = None

    tem_piscina: Optional[bool] = False
    tem_churrasqueira: Optional[bool] = False
    tem_portao_eletronico: Optional[bool] = False
    tem_ar_condicionado: Optional[bool] = False
    tem_armarios: Optional[bool] = False
    tem_cerca_eletrica: Optional[bool] = False
    aceita_permuta: Optional[bool] = False
    aceita_financiamento: Optional[bool] = False

    model_config = ConfigDict(extra="ignore")


class ImovelCreate(ImovelBase):
    pass


class ImovelUpdate(ImovelBase):
    pass


class ImovelOut(ImovelBase):
    id: int
    empresa_id: int
    corretor_id: Optional[int] = None
    public_token: Optional[str] = None
    publicado: Optional[bool] = True

    model_config = ConfigDict(from_attributes=True)