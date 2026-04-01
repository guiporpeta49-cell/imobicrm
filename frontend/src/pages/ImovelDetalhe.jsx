import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api, { API_BASE_URL } from "../services/api";
import { Button, Card } from "../components/ui";

function fmtCurrency(value) {
  return value !== null && value !== undefined && value !== ""
    ? Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "-";
}

function valorOuTraco(value) {
  return value !== null && value !== undefined && value !== "" ? value : "-";
}

function boolText(value) {
  return value ? "Sim" : "Não";
}

function isTipoFazenda(imovel) {
  const tipo = String(imovel?.tipo || "").trim().toLowerCase();
  return ["fazenda", "sitio", "sítio", "chacara", "chácara", "rural"].includes(tipo);
}

function enderecoCompleto(imovel) {
  return [
    imovel?.rua,
    imovel?.numero,
    imovel?.complemento,
    imovel?.bairro,
    imovel?.cidade,
    imovel?.estado,
    imovel?.cep,
  ]
    .filter(Boolean)
    .join(" • ");
}

function getMapaLink(imovel) {
  const isFazenda = isTipoFazenda(imovel);

  if (isFazenda && imovel?.link_maps) {
    return imovel.link_maps;
  }

  if (imovel?.latitude && imovel?.longitude) {
    return `https://www.google.com/maps?q=${imovel.latitude},${imovel.longitude}`;
  }

  const endereco = [
    imovel?.rua,
    imovel?.numero,
    imovel?.complemento,
    imovel?.bairro,
    imovel?.cidade,
    imovel?.estado,
    imovel?.cep,
  ]
    .filter(Boolean)
    .join(", ");

  if (isFazenda) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      imovel?.municipio || imovel?.cidade || "Brasil"
    )}`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(
    endereco || imovel?.cidade || "Brasil"
  )}`;
}

function getMapaEmbed(imovel) {
  const isFazenda = isTipoFazenda(imovel);

  if (isFazenda && imovel?.link_maps) {
    const link = String(imovel.link_maps).trim();
    if (link.includes("/maps/embed")) return link;
    return `https://www.google.com/maps?q=${encodeURIComponent(link)}&output=embed`;
  }

  if (imovel?.latitude && imovel?.longitude) {
    return `https://www.google.com/maps?q=${imovel.latitude},${imovel.longitude}&z=14&output=embed`;
  }

  const endereco = [
    imovel?.rua,
    imovel?.numero,
    imovel?.complemento,
    imovel?.bairro,
    imovel?.cidade,
    imovel?.estado,
    imovel?.cep,
  ]
    .filter(Boolean)
    .join(", ");

  if (isFazenda) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      imovel?.municipio || imovel?.cidade || "Brasil"
    )}&output=embed`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(
    endereco || imovel?.cidade || "Brasil"
  )}&output=embed`;
}

function InfoCard({ label, value }) {
  if (value === null || value === undefined || value === "" || value === false) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 break-words font-semibold text-white">{value}</div>
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export default function ImovelDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [imovel, setImovel] = useState(null);
  const [midias, setMidias] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingShare, setLoadingShare] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  async function load() {
    const res1 = await api.get(`/imoveis/${id}`);
    const res2 = await api.get(`/imoveis/${id}/midias`).catch(() => ({ data: [] }));
    setImovel(res1.data);
    setMidias(res2.data || []);
    if (res2.data?.length) setSelected(res2.data[0]);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleWhatsApp() {
    try {
      setLoadingShare(true);
      const response = await api.get(`/imoveis/${id}/compartilhar`);
      window.open(response.data.whatsapp_url, "_blank");
    } catch (err) {
      alert(err?.response?.data?.detail || "Erro ao gerar compartilhamento");
    } finally {
      setLoadingShare(false);
    }
  }

  async function handlePdf() {
    try {
      const response = await api.get(`/imoveis/${id}/pdf`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      alert(err?.response?.data?.detail || "Erro ao gerar PDF");
    }
  }

  const isFazenda = useMemo(() => isTipoFazenda(imovel), [imovel]);
  const mapsLink = useMemo(() => getMapaLink(imovel), [imovel]);
  const mapaEmbed = useMemo(() => getMapaEmbed(imovel), [imovel]);

 const linkPublico = useMemo(() => {
  if (!imovel?.public_token) return null;
  return `${window.location.origin}/publico/imovel/${imovel.public_token}`;
}, [imovel]);

  const valorPrincipal = useMemo(() => {
    if (!imovel) return "-";
    if (imovel.finalidade === "aluguel") return fmtCurrency(imovel.valor_locacao);
    return fmtCurrency(imovel.valor_venda);
  }, [imovel]);

  const diferenciais = useMemo(() => {
    if (!imovel) return [];
    return [
      ["Piscina", imovel.tem_piscina],
      ["Churrasqueira", imovel.tem_churrasqueira],
      ["Portão eletrônico", imovel.tem_portao_eletronico],
      ["Ar-condicionado", imovel.tem_ar_condicionado],
      ["Armários planejados", imovel.tem_armarios],
      ["Cerca elétrica", imovel.tem_cerca_eletrica],
      ["Aceita permuta", imovel.aceita_permuta],
      ["Aceita financiamento", imovel.aceita_financiamento],
    ]
      .filter(([, ativo]) => ativo)
      .map(([nome]) => nome);
  }, [imovel]);

  if (!imovel) {
    return (
      <Layout>
        <Card>Carregando...</Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Voltar
        </Button>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button variant="success" onClick={handleWhatsApp} disabled={loadingShare}>
            {loadingShare ? "Gerando..." : "Enviar no WhatsApp"}
          </Button>
          <Button onClick={handlePdf}>Gerar PDF</Button>
          {linkPublico ? (
           <a href={linkPublico} target="_blank" rel="noopener noreferrer">
  <Button variant="secondary">
    Abrir página pública
  </Button>
</a>
          ) : null}
          <Button variant="secondary" onClick={() => navigate(`/imoveis?editar=${imovel.id}`)}>
            Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <Card>
          <div
            className="cursor-pointer overflow-hidden rounded-3xl bg-slate-100"
            onClick={() => selected && setOpenPreview(true)}
          >
            {selected && selected.tipo === "foto" ? (
              <img
                src={`${API_BASE_URL}${selected.arquivo_url}`}
                alt={selected.nome_arquivo}
                className="h-[260px] w-full object-cover sm:h-[360px] xl:h-[440px]"
              />
            ) : selected ? (
              <video
                controls
                src={`${API_BASE_URL}${selected.arquivo_url}`}
                className="h-[260px] w-full object-cover sm:h-[360px] xl:h-[440px]"
              />
            ) : (
              <div className="flex h-[440px] items-center justify-center text-slate-400">
                Sem mídia cadastrada
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            {midias.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  setOpenPreview(true);
                }}
                className={`overflow-hidden rounded-2xl border-2 ${
                  selected?.id === m.id ? "border-blue-600" : "border-transparent"
                }`}
              >
                {m.tipo === "foto" ? (
                  <img
                    src={`${API_BASE_URL}${m.arquivo_url}`}
                    alt={m.nome_arquivo}
                    className="h-20 w-28 object-cover"
                  />
                ) : (
                  <video
                    src={`${API_BASE_URL}${m.arquivo_url}`}
                    className="h-20 w-28 object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h1 className="text-3xl font-bold tracking-tight text-white">{imovel.titulo}</h1>
            <div className="mt-3 text-3xl font-extrabold text-blue-300">{valorPrincipal}</div>
            <p className="mt-3 text-sm text-slate-400">
              {isFazenda
                ? [imovel.nome_fazenda, imovel.municipio || imovel.cidade, imovel.estado]
                    .filter(Boolean)
                    .join(" • ")
                : enderecoCompleto(imovel)}
            </p>
          </Card>

          <Secao titulo="Resumo">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard label="Tipo" value={imovel.tipo} />
              <InfoCard label="Finalidade" value={imovel.finalidade} />
              <InfoCard label="Status" value={imovel.status} />
              <InfoCard label="Venda" value={fmtCurrency(imovel.valor_venda)} />
              <InfoCard label="Locação" value={fmtCurrency(imovel.valor_locacao)} />
              <InfoCard label="IPTU" value={fmtCurrency(imovel.valor_iptu)} />
              <InfoCard label="Condomínio" value={fmtCurrency(imovel.valor_condominio)} />
              <InfoCard label="Quartos" value={imovel.quartos} />
              <InfoCard label="Suítes" value={imovel.suites} />
              <InfoCard label="Banheiros" value={imovel.banheiros} />
              <InfoCard label="Vagas cobertas" value={imovel.vagas_cobertas} />
              <InfoCard label="Vagas descobertas" value={imovel.vagas_descobertas} />
            </div>
          </Secao>

          <Secao titulo="Proprietário">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard label="Nome" value={imovel.proprietario_nome} />
              <InfoCard label="Telefone" value={imovel.proprietario_telefone} />
              <InfoCard label="CPF/CNPJ" value={imovel.proprietario_cpf_cnpj} />
              <InfoCard label="Data de nascimento" value={imovel.proprietario_data_nascimento} />
              <InfoCard label="E-mail" value={imovel.proprietario_email} />
            </div>
          </Secao>

          <Secao titulo="Publicação">
            <div className="grid gap-3">
              <InfoCard label="Publicado" value={imovel.publicado ? "Sim" : "Não"} />
              <InfoCard label="Token público" value={imovel.public_token} />
              {linkPublico ? <InfoCard label="Link público" value={linkPublico} /> : null}
            </div>
          </Secao>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Secao titulo="Endereço e localização">
          <div className="grid gap-3 sm:grid-cols-2">
            {!isFazenda ? (
              <InfoCard label="Endereço completo" value={enderecoCompleto(imovel)} />
            ) : (
              <InfoCard label="Link do Maps" value={imovel.link_maps} />
            )}
            <InfoCard label="CEP" value={imovel.cep} />
            <InfoCard label="Rua" value={imovel.rua} />
            <InfoCard label="Número" value={imovel.numero} />
            <InfoCard label="Complemento" value={imovel.complemento} />
            <InfoCard label="Bairro" value={imovel.bairro} />
            <InfoCard label="Cidade" value={imovel.cidade} />
            <InfoCard label="Município" value={imovel.municipio} />
            <InfoCard label="Estado" value={imovel.estado} />
            <InfoCard label="Referência" value={imovel.referencia_local} />
            <InfoCard label="Latitude" value={imovel.latitude} />
            <InfoCard label="Longitude" value={imovel.longitude} />
          </div>
        </Secao>

        <Secao titulo="Descrição e observações">
          <div className="grid gap-3">
            <InfoCard label="Descrição" value={imovel.descricao || "Sem descrição cadastrada."} />
            <InfoCard label="Observação geral" value={imovel.observacao_geral} />
            <InfoCard label="Link de vídeo" value={imovel.link_video} />
          </div>
        </Secao>
      </div>

      <div className="mt-6">
        <Secao titulo="Características gerais">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard label="Área construída" value={imovel.area_construida ? `${imovel.area_construida} m²` : null} />
            <InfoCard label="Área do terreno" value={imovel.area_terreno ? `${imovel.area_terreno} m²` : null} />
            <InfoCard label="Área livre" value={imovel.area_livre ? `${imovel.area_livre} m²` : null} />
            <InfoCard label="Topografia" value={imovel.topografia} />
            <InfoCard label="Zoneamento" value={imovel.zoneamento} />
            <InfoCard label="Asfalto" value={boolText(imovel.possui_asfalto)} />
            <InfoCard label="Luz" value={boolText(imovel.possui_luz)} />
            <InfoCard label="Esgoto" value={boolText(imovel.possui_esgoto)} />
            <InfoCard label="Água encanada" value={boolText(imovel.possui_agua_encanada)} />
            <InfoCard label="Frente" value={imovel.frente ? `${imovel.frente} m` : null} />
            <InfoCard label="Fundo" value={imovel.fundo ? `${imovel.fundo} m` : null} />
            <InfoCard label="Lateral esquerda" value={imovel.lateral_esquerda ? `${imovel.lateral_esquerda} m` : null} />
            <InfoCard label="Lateral direita" value={imovel.lateral_direita ? `${imovel.lateral_direita} m` : null} />
          </div>
        </Secao>
      </div>

      {imovel.tipo === "casa" && (
        <div className="mt-6">
          <Secao titulo="Detalhes da casa">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Tipo da casa" value={imovel.casa_tipo} />
              <InfoCard label="Sala de estar" value={boolText(imovel.sala_estar)} />
              <InfoCard label="Sala de jantar" value={boolText(imovel.sala_jantar)} />
              <InfoCard label="Copa" value={boolText(imovel.copa)} />
              <InfoCard label="Cozinha" value={boolText(imovel.cozinha)} />
            </div>
          </Secao>
        </div>
      )}

      {imovel.tipo === "apartamento" && (
        <div className="mt-6">
          <Secao titulo="Detalhes do apartamento">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Número do AP" value={imovel.ap_numero} />
              <InfoCard label="Bloco" value={imovel.ap_bloco} />
              <InfoCard label="Andar" value={imovel.ap_andar} />
              <InfoCard label="Elevador" value={boolText(imovel.tem_elevador)} />
              <InfoCard label="Vagas demarcadas" value={boolText(imovel.vagas_demarcadas)} />
              <InfoCard label="Academia" value={boolText(imovel.cond_academia)} />
              <InfoCard label="Salão de festas" value={boolText(imovel.cond_salao_festas)} />
              <InfoCard label="Piscina do condomínio" value={boolText(imovel.cond_piscina)} />
              <InfoCard label="Portaria 24h" value={boolText(imovel.cond_portaria_24h)} />
            </div>
          </Secao>
        </div>
      )}

      {imovel.tipo === "terreno" && (
        <div className="mt-6">
          <Secao titulo="Detalhes do terreno">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Topografia" value={imovel.topografia} />
              <InfoCard label="Zoneamento" value={imovel.zoneamento} />
              <InfoCard label="Asfalto" value={boolText(imovel.possui_asfalto)} />
              <InfoCard label="Luz" value={boolText(imovel.possui_luz)} />
              <InfoCard label="Esgoto" value={boolText(imovel.possui_esgoto)} />
              <InfoCard label="Água encanada" value={boolText(imovel.possui_agua_encanada)} />
            </div>
          </Secao>
        </div>
      )}

      {isFazenda && (
        <div className="mt-6">
          <Secao titulo="Detalhes da fazenda / rural">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Nome da fazenda" value={imovel.nome_fazenda} />
              <InfoCard label="Município" value={imovel.municipio} />
              <InfoCard label="Distância do asfalto" value={imovel.distancia_asfalto_km ? `${imovel.distancia_asfalto_km} km` : null} />
              <InfoCard label="Distância da cidade" value={imovel.distancia_cidade_km ? `${imovel.distancia_cidade_km} km` : null} />
              <InfoCard label="Área total em hectares" value={imovel.area_total_hectares} />
              <InfoCard label="Área total em alqueires" value={imovel.area_total_alqueires} />
              <InfoCard label="Área agricultável" value={imovel.area_agricultavel} />
              <InfoCard label="Área de pastagem" value={imovel.area_pastagem} />
              <InfoCard label="Área inaproveitável" value={imovel.area_inaproveitavel} />
              <InfoCard label="Rio" value={boolText(imovel.possui_rio)} />
              <InfoCard label="Nascente" value={boolText(imovel.possui_nascente)} />
              <InfoCard label="Poço artesiano" value={boolText(imovel.possui_poco_artesiano)} />
              <InfoCard label="Curral" value={boolText(imovel.possui_curral)} />
              <InfoCard label="Casa de caseiro" value={boolText(imovel.possui_casa_caseiro)} />
            </div>
          </Secao>
        </div>
      )}

      {imovel.tipo === "comercial" && (
        <div className="mt-6">
          <Secao titulo="Detalhes do imóvel comercial">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Tipo comercial" value={imovel.comercio_tipo} />
              <InfoCard label="Pé-direito" value={imovel.pe_direito ? `${imovel.pe_direito} m` : null} />
              <InfoCard label="Tipo de piso" value={imovel.tipo_piso} />
              <InfoCard label="Vitrine" value={boolText(imovel.vitrine)} />
              <InfoCard label="Banheiro PNE" value={boolText(imovel.banheiro_pne)} />
              <InfoCard label="Rampas de acesso" value={boolText(imovel.rampas_acesso)} />
              <InfoCard label="Tipo de energia" value={imovel.tipo_energia} />
            </div>
          </Secao>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Secao titulo="Diferenciais">
          <div className="flex flex-wrap gap-2">
            {diferenciais.length ? (
              diferenciais.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-slate-400">Nenhum diferencial marcado.</span>
            )}
          </div>
        </Secao>

        <Secao titulo="Mapa e localização">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <iframe
              src={mapaEmbed}
              className="h-[260px] w-full sm:h-[360px]"
              style={{ border: "none" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa do imóvel"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => window.open(mapsLink, "_blank")}>
              Abrir no Google Maps
            </Button>
          </div>
        </Secao>
      </div>

      {openPreview && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setOpenPreview(false)}
            className="absolute right-6 top-6 rounded-2xl bg-white/10 px-4 py-2 text-white"
          >
            Fechar
          </button>

          <div className="max-h-[90vh] max-w-[95vw]">
            {selected.tipo === "foto" ? (
              <img
                src={`${API_BASE_URL}${selected.arquivo_url}`}
                className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
                alt={selected.nome_arquivo}
              />
            ) : (
              <video
                controls
                autoPlay
                src={`${API_BASE_URL}${selected.arquivo_url}`}
                className="max-h-[90vh] max-w-[95vw] rounded-2xl"
              />
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
