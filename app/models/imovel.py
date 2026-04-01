from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, Enum, Boolean, Date
from sqlalchemy.orm import relationship
from app.database import Base


class Imovel(Base):
    __tablename__ = "imoveis"

    id = Column(Integer, primary_key=True, index=True)

    # dados principais
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=True)
    tipo = Column(
        Enum("casa", "apartamento", "terreno", "comercial", "fazenda", name="tipo_imovel"),
        nullable=False,
    )
    finalidade = Column(
        Enum("venda", "aluguel", name="finalidade_imovel"),
        nullable=False,
    )
    status = Column(
        Enum("disponivel", "reservado", "vendido", "alugado", name="status_imovel"),
        default="disponivel",
    )

    corretor_id = Column(Integer, ForeignKey("corretores.id"), nullable=True)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)

    # publicação
    public_token = Column(String(64), unique=True, index=True, nullable=True)
    publicado = Column(Boolean, default=True, nullable=False)

    # endereço / localização
    cep = Column(String(20), nullable=True)
    rua = Column(String(255), nullable=True)
    numero = Column(String(20), nullable=True)
    complemento = Column(String(255), nullable=True)
    bairro = Column(String(100), nullable=True)
    cidade = Column(String(100), nullable=True)
    estado = Column(String(2), nullable=True)
    referencia_local = Column(String(255), nullable=True)
    link_maps = Column(String(500), nullable=True)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    nome_fazenda = Column(String(255), nullable=True)
    municipio = Column(String(255), nullable=True)

    # proprietário
    proprietario_nome = Column(String(255), nullable=True)
    proprietario_telefone = Column(String(30), nullable=True)
    proprietario_cpf_cnpj = Column(String(20), nullable=True)
    proprietario_data_nascimento = Column(Date, nullable=True)
    proprietario_email = Column(String(150), nullable=True)

    # financeiro
    valor_venda = Column(DECIMAL(12, 2), nullable=True)
    valor_locacao = Column(DECIMAL(12, 2), nullable=True)
    valor_iptu = Column(DECIMAL(12, 2), nullable=True)
    valor_condominio = Column(DECIMAL(12, 2), nullable=True)

    # mídia / observações
    link_video = Column(String(500), nullable=True)
    observacao_geral = Column(Text, nullable=True)

    # características comuns
    quartos = Column(Integer, default=0)
    suites = Column(Integer, default=0)
    banheiros = Column(Integer, default=0)

    # bloco 1 - casa
    casa_tipo = Column(String(20), nullable=True)
    sala_estar = Column(Boolean, default=False, nullable=False)
    sala_jantar = Column(Boolean, default=False, nullable=False)
    copa = Column(Boolean, default=False, nullable=False)
    cozinha = Column(Boolean, default=False, nullable=False)
    vagas_cobertas = Column(Integer, default=0)
    vagas_descobertas = Column(Integer, default=0)
    area_construida = Column(DECIMAL(12, 2), nullable=True)
    area_terreno = Column(DECIMAL(12, 2), nullable=True)
    area_livre = Column(DECIMAL(12, 2), nullable=True)

    # bloco 2 - apartamento
    ap_numero = Column(String(20), nullable=True)
    ap_bloco = Column(String(20), nullable=True)
    ap_andar = Column(String(10), nullable=True)
    tem_elevador = Column(Boolean, default=False, nullable=False)
    vagas_demarcadas = Column(Boolean, default=False, nullable=False)
    cond_academia = Column(Boolean, default=False, nullable=False)
    cond_salao_festas = Column(Boolean, default=False, nullable=False)
    cond_piscina = Column(Boolean, default=False, nullable=False)
    cond_portaria_24h = Column(Boolean, default=False, nullable=False)

    # bloco 3 - terreno
    topografia = Column(String(20), nullable=True)
    frente = Column(DECIMAL(10, 2), nullable=True)
    fundo = Column(DECIMAL(10, 2), nullable=True)
    lateral_esquerda = Column(DECIMAL(10, 2), nullable=True)
    lateral_direita = Column(DECIMAL(10, 2), nullable=True)
    zoneamento = Column(String(20), nullable=True)
    possui_asfalto = Column(Boolean, default=False, nullable=False)
    possui_luz = Column(Boolean, default=False, nullable=False)
    possui_esgoto = Column(Boolean, default=False, nullable=False)
    possui_agua_encanada = Column(Boolean, default=False, nullable=False)

    # bloco 4 - rural / fazenda
    distancia_asfalto_km = Column(DECIMAL(10, 2), nullable=True)
    distancia_cidade_km = Column(DECIMAL(10, 2), nullable=True)
    area_total_hectares = Column(DECIMAL(12, 2), nullable=True)
    area_total_alqueires = Column(DECIMAL(12, 2), nullable=True)
    area_agricultavel = Column(DECIMAL(12, 2), nullable=True)
    area_pastagem = Column(DECIMAL(12, 2), nullable=True)
    area_inaproveitavel = Column(DECIMAL(12, 2), nullable=True)
    possui_rio = Column(Boolean, default=False, nullable=False)
    possui_nascente = Column(Boolean, default=False, nullable=False)
    possui_poco_artesiano = Column(Boolean, default=False, nullable=False)
    possui_curral = Column(Boolean, default=False, nullable=False)
    possui_casa_caseiro = Column(Boolean, default=False, nullable=False)

    # bloco 5 - comércio
    comercio_tipo = Column(String(30), nullable=True)
    pe_direito = Column(DECIMAL(10, 2), nullable=True)
    tipo_piso = Column(String(100), nullable=True)
    vitrine = Column(Boolean, default=False, nullable=False)
    banheiro_pne = Column(Boolean, default=False, nullable=False)
    rampas_acesso = Column(Boolean, default=False, nullable=False)
    tipo_energia = Column(String(20), nullable=True)

    # checklist de diferenciais
    tem_piscina = Column(Boolean, default=False, nullable=False)
    tem_churrasqueira = Column(Boolean, default=False, nullable=False)
    tem_portao_eletronico = Column(Boolean, default=False, nullable=False)
    tem_ar_condicionado = Column(Boolean, default=False, nullable=False)
    tem_armarios = Column(Boolean, default=False, nullable=False)
    tem_cerca_eletrica = Column(Boolean, default=False, nullable=False)
    aceita_permuta = Column(Boolean, default=False, nullable=False)
    aceita_financiamento = Column(Boolean, default=False, nullable=False)

    corretor = relationship("Corretor")
    empresa = relationship("Empresa")