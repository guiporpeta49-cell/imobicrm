import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import UploadMidiaImovel from "../components/UploadMidiaImovel";
import GaleriaImovel from "../components/GaleriaImovel";
import { PageHeader, Button, Field, Input, Select, Textarea, Alert, StatusBadge } from "../components/ui";

function formatCurrencyInput(value) {
  const number = String(value || "").replace(/\D/g, "");
  const amount = Number(number) / 100;
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseCurrency(value) {
  return Number(String(value || "").replace(/\D/g, "")) / 100;
}

function boolText(value) {
  return value ? "Sim" : "Não";
}

const checkboxFields = [
  ["tem_piscina", "Piscina"],
  ["tem_churrasqueira", "Churrasqueira"],
  ["tem_portao_eletronico", "Portão eletrônico"],
  ["tem_ar_condicionado", "Ar-condicionado"],
  ["tem_armarios", "Armários planejados"],
  ["tem_cerca_eletrica", "Cerca elétrica"],
  ["aceita_permuta", "Aceita permuta"],
  ["aceita_financiamento", "Aceita financiamento"],
];

const initialForm = {
  titulo: "",
  descricao: "",
  tipo: "apartamento",
  finalidade: "venda",
  status: "disponivel",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  referencia_local: "",
  link_maps: "",
  latitude: "",
  longitude: "",
  nome_fazenda: "",
  municipio: "",
  valor_venda: "",
  valor_locacao: "",
  valor_iptu: "",
  valor_condominio: "",
  link_video: "",
  observacao_geral: "",
  quartos: 0,
  suites: 0,
  banheiros: 0,
  corretor_id: "",
  proprietario_nome: "",
  proprietario_telefone: "",
  proprietario_cpf_cnpj: "",
  proprietario_data_nascimento: "",
  proprietario_email: "",
  casa_tipo: "",
  sala_estar: false,
  sala_jantar: false,
  copa: false,
  cozinha: false,
  vagas_cobertas: 0,
  vagas_descobertas: 0,
  area_construida: "",
  area_terreno: "",
  area_livre: "",
  ap_numero: "",
  ap_bloco: "",
  ap_andar: "",
  tem_elevador: false,
  vagas_demarcadas: false,
  cond_academia: false,
  cond_salao_festas: false,
  cond_piscina: false,
  cond_portaria_24h: false,
  topografia: "",
  frente: "",
  fundo: "",
  lateral_esquerda: "",
  lateral_direita: "",
  zoneamento: "",
  possui_asfalto: false,
  possui_luz: false,
  possui_esgoto: false,
  possui_agua_encanada: false,
  area_total_hectares: "",
  area_total_alqueires: "",
  distancia_asfalto_km: "",
  distancia_cidade_km: "",
  area_agricultavel: "",
  area_pastagem: "",
  area_inaproveitavel: "",
  possui_rio: false,
  possui_nascente: false,
  possui_poco_artesiano: false,
  possui_curral: false,
  possui_casa_caseiro: false,
  comercio_tipo: "",
  pe_direito: "",
  tipo_piso: "",
  vitrine: false,
  banheiro_pne: false,
  rampas_acesso: false,
  tipo_energia: "",
  tem_piscina: false,
  tem_churrasqueira: false,
  tem_portao_eletronico: false,
  tem_ar_condicionado: false,
  tem_armarios: false,
  tem_cerca_eletrica: false,
  aceita_permuta: false,
  aceita_financiamento: false,
};

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm">
      <div className="text-slate-400">{label}</div>
      <div className="mt-1 font-semibold text-white">{value ?? "-"}</div>
    </div>
  );
}

function Checkbox({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-emerald-500" />
      <span>{label}</span>
    </label>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <div className="mb-4">
        <div className="text-sm font-semibold text-white">{title}</div>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${active ? "bg-cyan-500 text-slate-950" : "border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
    >
      {children}
    </button>
  );
}

export default function ImoveisPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [reloadMidiaKey, setReloadMidiaKey] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fetchingCep, setFetchingCep] = useState(false);
  const [activeTab, setActiveTab] = useState("principal");
  const { isAdmin, user } = useAuth();

  const tipo = String(form.tipo || "").toLowerCase();

  const tabs = [
    { key: "principal", label: "Dados principais" },
    { key: "proprietario", label: "Proprietário" },
    { key: "endereco", label: "Endereço" },
    { key: "financeiro", label: "Financeiro" },
    { key: "especifico", label: `Bloco: ${tipo === "fazenda" ? "Fazenda / Rural" : tipo === "apartamento" ? "Apartamento" : tipo === "casa" ? "Casa" : tipo === "terreno" ? "Terreno" : "Comércio"}` },
    { key: "diferenciais", label: "Diferenciais e mídia" },
  ];

  useEffect(() => {
    if (!["casa", "apartamento", "terreno", "fazenda", "comercial"].includes(tipo)) return;
    setActiveTab("especifico");
  }, [tipo]);

  async function loadItems() {
    try {
      const response = await api.get("/imoveis/");
      setItems(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao carregar imóveis");
    }
  }

  async function loadCorretores() {
    try {
      const response = await api.get("/corretores/");
      setCorretores(response.data);
    } catch {}
  }

  useEffect(() => {
    loadItems();
    if (isAdmin) loadCorretores();
  }, [isAdmin]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleCurrencyChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: formatCurrencyInput(value) }));
  }

  async function buscarCep(cep) {
    const cleanCep = String(cep || "").replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    try {
      setFetchingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data?.erro) return;
      setForm((prev) => ({
        ...prev,
        rua: prev.rua || data.logradouro || "",
        bairro: prev.bairro || data.bairro || "",
        cidade: prev.cidade || data.localidade || "",
        estado: prev.estado || data.uf || "",
        complemento: prev.complemento || data.complemento || "",
      }));
    } finally {
      setFetchingCep(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setReloadMidiaKey(0);
    setActiveTab("principal");
  }

  function openNew() {
    resetForm();
    setError("");
    setMessage("");
    setOpenForm(true);
  }

  function closeModal() {
    setOpenForm(false);
    resetForm();
  }

  function handleUploadedMidia() {
    setReloadMidiaKey((prev) => prev + 1);
    loadItems();
  }

  function hydrateForm(item) {
    return {
      ...initialForm,
      ...item,
      valor_venda: item.valor_venda ? fmtCurrency(item.valor_venda) : "",
      valor_locacao: item.valor_locacao ? fmtCurrency(item.valor_locacao) : "",
      valor_iptu: item.valor_iptu ? fmtCurrency(item.valor_iptu) : "",
      valor_condominio: item.valor_condominio ? fmtCurrency(item.valor_condominio) : "",
      proprietario_data_nascimento: item.proprietario_data_nascimento || "",
      corretor_id: item.corretor_id ?? "",
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      ...form,
      valor_venda: form.valor_venda ? parseCurrency(form.valor_venda) : null,
      valor_locacao: form.valor_locacao ? parseCurrency(form.valor_locacao) : null,
      valor_iptu: form.valor_iptu ? parseCurrency(form.valor_iptu) : null,
      valor_condominio: form.valor_condominio ? parseCurrency(form.valor_condominio) : null,
      quartos: Number(form.quartos || 0),
      suites: Number(form.suites || 0),
      banheiros: Number(form.banheiros || 0),
      vagas_cobertas: Number(form.vagas_cobertas || 0),
      vagas_descobertas: Number(form.vagas_descobertas || 0),
      corretor_id: form.corretor_id ? Number(form.corretor_id) : isAdmin ? null : user?.id || null,
      proprietario_data_nascimento: form.proprietario_data_nascimento || null,
      area_total_hectares: toNumberOrNull(form.area_total_hectares),
      area_total_alqueires: toNumberOrNull(form.area_total_alqueires),
      distancia_asfalto_km: toNumberOrNull(form.distancia_asfalto_km),
      distancia_cidade_km: toNumberOrNull(form.distancia_cidade_km),
      area_agricultavel: toNumberOrNull(form.area_agricultavel),
      area_pastagem: toNumberOrNull(form.area_pastagem),
      area_inaproveitavel: toNumberOrNull(form.area_inaproveitavel),
      area_construida: toNumberOrNull(form.area_construida),
      area_terreno: toNumberOrNull(form.area_terreno),
      area_livre: toNumberOrNull(form.area_livre),
      frente: toNumberOrNull(form.frente),
      fundo: toNumberOrNull(form.fundo),
      lateral_esquerda: toNumberOrNull(form.lateral_esquerda),
      lateral_direita: toNumberOrNull(form.lateral_direita),
      pe_direito: toNumberOrNull(form.pe_direito),
      descricao: form.descricao || null,
      observacao_geral: form.observacao_geral || null,
      link_video: form.link_video || null,
      nome_fazenda: form.nome_fazenda || null,
      municipio: form.municipio || null,
      link_maps: form.link_maps || null,
      latitude: form.latitude || null,
      longitude: form.longitude || null,
    };

    try {
      if (editingId) {
        await api.put(`/imoveis/${editingId}`, payload);
        setMessage("Imóvel atualizado com sucesso");
        await loadItems();
        closeModal();
      } else {
        const response = await api.post("/imoveis/", payload);
        setMessage("Imóvel cadastrado com sucesso. Agora você já pode enviar mídias.");
        await loadItems();
        setEditingId(response.data.id);
        setForm(hydrateForm(response.data));
        setOpenForm(true);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao salvar imóvel");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm(hydrateForm(item));
    setActiveTab("principal");
    setError("");
    setMessage("");
    setReloadMidiaKey(0);
    setOpenForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir este imóvel?")) return;
    try {
      await api.delete(`/imoveis/${id}`);
      setMessage("Imóvel removido com sucesso");
      loadItems();
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao excluir imóvel");
    }
  }

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return items;
    return items.filter((item) =>
      [
        item.titulo, item.tipo, item.finalidade, item.cidade, item.bairro, item.estado, item.cep, item.status,
        item.proprietario_nome, item.proprietario_telefone, item.proprietario_email, item.nome_fazenda, item.municipio,
        item.comercio_tipo, item.casa_tipo, item.zoneamento,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, search]);

  const renderSpecificSection = () => {
    if (tipo === "casa") {
      return (
        <SectionCard title="Bloco 1 — Casa" subtitle="Ao selecionar Casa, este bloco é aberto automaticamente e os demais específicos ficam ocultos.">
          <Field label="Tipo"><Select name="casa_tipo" value={form.casa_tipo} onChange={handleChange}><option value="">Selecione</option><option value="terrea">Térrea</option><option value="sobrado">Sobrado</option><option value="edicula">Edícula</option></Select></Field>
          <Field label="Quartos"><Input name="quartos" type="number" value={form.quartos} onChange={handleChange} /></Field>
          <Field label="Suítes"><Input name="suites" type="number" value={form.suites} onChange={handleChange} /></Field>
          <Field label="Banheiros"><Input name="banheiros" type="number" value={form.banheiros} onChange={handleChange} /></Field>
          <Checkbox name="sala_estar" label="Sala de estar" checked={form.sala_estar} onChange={handleChange} />
          <Checkbox name="sala_jantar" label="Sala de jantar" checked={form.sala_jantar} onChange={handleChange} />
          <Checkbox name="copa" label="Copa" checked={form.copa} onChange={handleChange} />
          <Checkbox name="cozinha" label="Cozinha" checked={form.cozinha} onChange={handleChange} />
          <Field label="Vagas cobertas"><Input name="vagas_cobertas" type="number" value={form.vagas_cobertas} onChange={handleChange} /></Field>
          <Field label="Vagas descobertas"><Input name="vagas_descobertas" type="number" value={form.vagas_descobertas} onChange={handleChange} /></Field>
          <Field label="Área construída (m²)"><Input name="area_construida" value={form.area_construida} onChange={handleChange} /></Field>
          <Field label="Área do terreno (m²)"><Input name="area_terreno" value={form.area_terreno} onChange={handleChange} /></Field>
          <Field label="Área livre / quintal (m²)"><Input name="area_livre" value={form.area_livre} onChange={handleChange} /></Field>
        </SectionCard>
      );
    }

    if (tipo === "apartamento") {
      return (
        <SectionCard title="Bloco 2 — Apartamento" subtitle="Estrutura, localização interna e lazer do condomínio.">
          <Field label="Número do AP"><Input name="ap_numero" value={form.ap_numero} onChange={handleChange} /></Field>
          <Field label="Bloco"><Input name="ap_bloco" value={form.ap_bloco} onChange={handleChange} /></Field>
          <Field label="Andar / pavimento"><Input name="ap_andar" value={form.ap_andar} onChange={handleChange} /></Field>
          <Field label="Condomínio"><Input name="valor_condominio" type="text" value={form.valor_condominio} onChange={handleCurrencyChange} placeholder="R$ 0,00" /></Field>
          <Field label="Quartos"><Input name="quartos" type="number" value={form.quartos} onChange={handleChange} /></Field>
          <Field label="Suítes"><Input name="suites" type="number" value={form.suites} onChange={handleChange} /></Field>
          <Field label="Banheiros"><Input name="banheiros" type="number" value={form.banheiros} onChange={handleChange} /></Field>
          <Field label="Vagas"><Input name="vagas_cobertas" type="number" value={form.vagas_cobertas} onChange={handleChange} /></Field>
          <Checkbox name="tem_elevador" label="Tem elevador" checked={form.tem_elevador} onChange={handleChange} />
          <Checkbox name="vagas_demarcadas" label="Vagas demarcadas / fixas" checked={form.vagas_demarcadas} onChange={handleChange} />
          <Checkbox name="cond_academia" label="Academia" checked={form.cond_academia} onChange={handleChange} />
          <Checkbox name="cond_salao_festas" label="Salão de festas" checked={form.cond_salao_festas} onChange={handleChange} />
          <Checkbox name="cond_piscina" label="Piscina do condomínio" checked={form.cond_piscina} onChange={handleChange} />
          <Checkbox name="cond_portaria_24h" label="Portaria 24h" checked={form.cond_portaria_24h} onChange={handleChange} />
        </SectionCard>
      );
    }

    if (tipo === "terreno") {
      return (
        <SectionCard title="Bloco 3 — Terreno" subtitle="Dimensões, topografia e infraestrutura.">
          <Field label="Topografia"><Select name="topografia" value={form.topografia} onChange={handleChange}><option value="">Selecione</option><option value="plano">Plano</option><option value="aclive">Aclive</option><option value="declive">Declive</option></Select></Field>
          <Field label="Frente (m)"><Input name="frente" value={form.frente} onChange={handleChange} /></Field>
          <Field label="Fundo (m)"><Input name="fundo" value={form.fundo} onChange={handleChange} /></Field>
          <Field label="Lateral esquerda (m)"><Input name="lateral_esquerda" value={form.lateral_esquerda} onChange={handleChange} /></Field>
          <Field label="Lateral direita (m)"><Input name="lateral_direita" value={form.lateral_direita} onChange={handleChange} /></Field>
          <Field label="Zoneamento"><Select name="zoneamento" value={form.zoneamento} onChange={handleChange}><option value="">Selecione</option><option value="residencial">Residencial</option><option value="comercial">Comercial</option><option value="industrial">Industrial</option></Select></Field>
          <Checkbox name="possui_asfalto" label="Possui asfalto" checked={form.possui_asfalto} onChange={handleChange} />
          <Checkbox name="possui_luz" label="Possui luz" checked={form.possui_luz} onChange={handleChange} />
          <Checkbox name="possui_esgoto" label="Possui esgoto" checked={form.possui_esgoto} onChange={handleChange} />
          <Checkbox name="possui_agua_encanada" label="Possui água encanada" checked={form.possui_agua_encanada} onChange={handleChange} />
        </SectionCard>
      );
    }

    if (tipo === "fazenda") {
      return (
        <SectionCard title="Bloco 4 — Fazenda / Rural" subtitle="Quando o usuário seleciona Fazenda, este bloco abre automaticamente e os demais específicos ficam escondidos.">
          <Field label="Nome da fazenda"><Input name="nome_fazenda" value={form.nome_fazenda} onChange={handleChange} /></Field>
          <Field label="Município"><Input name="municipio" value={form.municipio} onChange={handleChange} /></Field>
          <Field label="Área total (hectares)"><Input name="area_total_hectares" value={form.area_total_hectares} onChange={handleChange} /></Field>
          <Field label="Área total (alqueires)"><Input name="area_total_alqueires" value={form.area_total_alqueires} onChange={handleChange} /></Field>
          <Field label="Distância do asfalto (km)"><Input name="distancia_asfalto_km" value={form.distancia_asfalto_km} onChange={handleChange} /></Field>
          <Field label="Distância da cidade (km)"><Input name="distancia_cidade_km" value={form.distancia_cidade_km} onChange={handleChange} /></Field>
          <Field label="Área agricultável"><Input name="area_agricultavel" value={form.area_agricultavel} onChange={handleChange} /></Field>
          <Field label="Área de pastagem"><Input name="area_pastagem" value={form.area_pastagem} onChange={handleChange} /></Field>
          <Field label="Área inaproveitável"><Input name="area_inaproveitavel" value={form.area_inaproveitavel} onChange={handleChange} /></Field>
          <Checkbox name="possui_rio" label="Rio" checked={form.possui_rio} onChange={handleChange} />
          <Checkbox name="possui_nascente" label="Nascente" checked={form.possui_nascente} onChange={handleChange} />
          <Checkbox name="possui_poco_artesiano" label="Poço artesiano" checked={form.possui_poco_artesiano} onChange={handleChange} />
          <Checkbox name="possui_curral" label="Curral" checked={form.possui_curral} onChange={handleChange} />
          <Checkbox name="possui_casa_caseiro" label="Casa de caseiro" checked={form.possui_casa_caseiro} onChange={handleChange} />
        </SectionCard>
      );
    }

    return (
      <SectionCard title="Bloco 5 — Comércio" subtitle="Estrutura comercial e acessibilidade.">
        <Field label="Tipo"><Select name="comercio_tipo" value={form.comercio_tipo} onChange={handleChange}><option value="">Selecione</option><option value="loja_rua">Loja de rua</option><option value="sala_comercial">Sala em prédio comercial</option><option value="galpao">Galpão</option></Select></Field>
        <Field label="Pé direito"><Input name="pe_direito" value={form.pe_direito} onChange={handleChange} /></Field>
        <Field label="Tipo de piso"><Input name="tipo_piso" value={form.tipo_piso} onChange={handleChange} /></Field>
        <Field label="Banheiros"><Input name="banheiros" type="number" value={form.banheiros} onChange={handleChange} /></Field>
        <Checkbox name="vitrine" label="Vitrine" checked={form.vitrine} onChange={handleChange} />
        <Checkbox name="banheiro_pne" label="Banheiro PNE" checked={form.banheiro_pne} onChange={handleChange} />
        <Checkbox name="rampas_acesso" label="Rampas de acesso" checked={form.rampas_acesso} onChange={handleChange} />
        <Field label="Energia"><Select name="tipo_energia" value={form.tipo_energia} onChange={handleChange}><option value="">Selecione</option><option value="monofasica">Monofásica</option><option value="trifasica">Trifásica</option></Select></Field>
      </SectionCard>
    );
  };

  return (
    <Layout>
      <PageHeader
        title="Imóveis"
        subtitle="Cadastro profissional por tipo, agora com abas para reduzir a altura da tela e abrir automaticamente o bloco específico do tipo selecionado."
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar imóvel..." className="w-full sm:w-72" />
            <Button onClick={openNew}>Novo imóvel</Button>
          </div>
        }
      />

      {error ? <Alert>{error}</Alert> : null}
      {message ? <Alert type="success">{message}</Alert> : null}

      <div className="grid gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-[2rem] border border-cyan-900/40 bg-[#071526]/88 shadow-[0_15px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{item.titulo}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {item.tipo === "fazenda"
                      ? `${item.nome_fazenda || "Fazenda"} • ${item.municipio || item.cidade || "Município"}${item.estado ? ` - ${item.estado}` : ""}`
                      : `${item.cidade || "Cidade"} • ${item.bairro || "Bairro"}${item.estado ? ` • ${item.estado}` : ""}`}
                  </p>
                </div>
                <StatusBadge value={item.status} />
              </div>

              <div className="mt-5 text-4xl font-bold tracking-tight text-white">{fmtCurrency(item.finalidade === "aluguel" ? item.valor_locacao : item.valor_venda)}</div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoBox label="Tipo" value={item.tipo} />
                <InfoBox label="Finalidade" value={item.finalidade} />
                <InfoBox label="Quartos" value={item.quartos} />
                <InfoBox label="Vagas" value={(Number(item.vagas_cobertas || 0) + Number(item.vagas_descobertas || 0)) || "-"} />
                <InfoBox label="Proprietário" value={item.proprietario_nome || "-"} />
                <InfoBox label="Telefone" value={item.proprietario_telefone || "-"} />
                <InfoBox label="Venda" value={item.valor_venda ? fmtCurrency(item.valor_venda) : "-"} />
                <InfoBox label="Locação" value={item.valor_locacao ? fmtCurrency(item.valor_locacao) : "-"} />
                {item.tipo === "fazenda" ? (
                  <>
                    <InfoBox label="Área total (ha)" value={item.area_total_hectares ?? "-"} />
                    <InfoBox label="Área de pastagem" value={item.area_pastagem ?? "-"} />
                    <InfoBox label="Área agricultável" value={item.area_agricultavel ?? "-"} />
                    <InfoBox label="Distância da cidade" value={item.distancia_cidade_km ? `${item.distancia_cidade_km} km` : "-"} />
                  </>
                ) : (
                  <>
                    <InfoBox label="CEP" value={item.cep || "-"} />
                    <InfoBox label="Endereço" value={[item.rua, item.numero].filter(Boolean).join(", ") || "-"} />
                    <InfoBox label="Aceita financiamento" value={boolText(item.aceita_financiamento)} />
                    <InfoBox label="Aceita permuta" value={boolText(item.aceita_permuta)} />
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button variant="secondary" onClick={() => handleEdit(item)}>Editar</Button>
                <Button onClick={() => navigate(`/imoveis/${item.id}`)}>Ver detalhes</Button>
                {isAdmin ? <Button variant="danger" onClick={() => handleDelete(item.id)}>Excluir</Button> : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={openForm} onClose={closeModal} title={editingId ? "Editar imóvel" : "Novo imóvel"} maxWidth="max-w-7xl">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-3">
            {tabs.map((tab) => (
              <TabButton key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </TabButton>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === "principal" ? (
              <SectionCard title="Dados principais" subtitle="Informações base do imóvel.">
                <div className="xl:col-span-2"><Field label="Título"><Input name="titulo" value={form.titulo} onChange={handleChange} required /></Field></div>
                <Field label="Tipo"><Select name="tipo" value={form.tipo} onChange={handleChange}><option value="casa">Casa</option><option value="apartamento">Apartamento</option><option value="terreno">Terreno</option><option value="comercial">Comercial</option><option value="fazenda">Fazenda / Rural</option></Select></Field>
                <Field label="Finalidade"><Select name="finalidade" value={form.finalidade} onChange={handleChange}><option value="venda">Venda</option><option value="aluguel">Aluguel</option></Select></Field>
                <Field label="Valor principal"><Input name="valor_venda" type="text" value={form.valor_venda} onChange={handleCurrencyChange} placeholder="R$ 0,00" /></Field>
                <Field label="Status"><Select name="status" value={form.status} onChange={handleChange}><option value="disponivel">Disponível</option><option value="reservado">Reservado</option><option value="vendido">Vendido</option><option value="alugado">Alugado</option></Select></Field>
                {isAdmin ? (
                  <Field label="Corretor responsável"><Select name="corretor_id" value={form.corretor_id} onChange={handleChange}><option value="">Selecione</option>{corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</Select></Field>
                ) : null}
                <div className="md:col-span-2 xl:col-span-4"><Field label="Descrição"><Textarea name="descricao" rows="4" value={form.descricao} onChange={handleChange} /></Field></div>
              </SectionCard>
            ) : null}

            {activeTab === "proprietario" ? (
              <SectionCard title="Bloco 0 — Proprietário" subtitle="Dados do proprietário do imóvel.">
                <Field label="Nome completo"><Input name="proprietario_nome" value={form.proprietario_nome} onChange={handleChange} /></Field>
                <Field label="CPF / CNPJ"><Input name="proprietario_cpf_cnpj" value={form.proprietario_cpf_cnpj} onChange={handleChange} /></Field>
                <Field label="Data de nascimento"><Input name="proprietario_data_nascimento" type="date" value={form.proprietario_data_nascimento} onChange={handleChange} /></Field>
                <Field label="Telefone / WhatsApp"><Input name="proprietario_telefone" value={form.proprietario_telefone} onChange={handleChange} /></Field>
                <div className="md:col-span-2 xl:col-span-2"><Field label="E-mail"><Input name="proprietario_email" value={form.proprietario_email} onChange={handleChange} /></Field></div>
              </SectionCard>
            ) : null}

            {activeTab === "endereco" ? (
              <SectionCard title="Endereço e localização" subtitle="CEP com busca automática, mapa e referência local.">
                <Field label={`CEP${fetchingCep ? " (buscando...)" : ""}`}><Input name="cep" value={form.cep} onChange={handleChange} onBlur={(e) => buscarCep(e.target.value)} /></Field>
                <Field label="Rua"><Input name="rua" value={form.rua} onChange={handleChange} /></Field>
                <Field label="Número"><Input name="numero" value={form.numero} onChange={handleChange} /></Field>
                <Field label="Complemento"><Input name="complemento" value={form.complemento} onChange={handleChange} /></Field>
                <Field label="Bairro"><Input name="bairro" value={form.bairro} onChange={handleChange} /></Field>
                <Field label="Cidade"><Input name="cidade" value={form.cidade} onChange={handleChange} /></Field>
                <Field label="Estado"><Input name="estado" value={form.estado} onChange={handleChange} maxLength={2} /></Field>
                <Field label="Referência local"><Input name="referencia_local" value={form.referencia_local} onChange={handleChange} /></Field>
                <div className="md:col-span-2"><Field label="Link do Google Maps"><Input name="link_maps" value={form.link_maps} onChange={handleChange} /></Field></div>
                <Field label="Latitude"><Input name="latitude" value={form.latitude} onChange={handleChange} /></Field>
                <Field label="Longitude"><Input name="longitude" value={form.longitude} onChange={handleChange} /></Field>
              </SectionCard>
            ) : null}

            {activeTab === "financeiro" ? (
              <SectionCard title="Financeiro" subtitle="Venda, locação, IPTU e condomínio.">
                <Field label="Valor de venda"><Input name="valor_venda" type="text" value={form.valor_venda} onChange={handleCurrencyChange} placeholder="R$ 0,00" /></Field>
                <Field label="Valor de locação"><Input name="valor_locacao" type="text" value={form.valor_locacao} onChange={handleCurrencyChange} placeholder="R$ 0,00" /></Field>
                <Field label="Valor do IPTU"><Input name="valor_iptu" type="text" value={form.valor_iptu} onChange={handleCurrencyChange} placeholder="R$ 0,00" /></Field>
                <Field label="Valor do condomínio"><Input name="valor_condominio" type="text" value={form.valor_condominio} onChange={handleCurrencyChange} placeholder="R$ 0,00" /></Field>
              </SectionCard>
            ) : null}

            {activeTab === "especifico" ? renderSpecificSection() : null}

            {activeTab === "diferenciais" ? (
              <SectionCard title="Diferenciais e mídia" subtitle="Checklist geral e área de mídias do imóvel.">
                {checkboxFields.map(([name, label]) => <Checkbox key={name} name={name} label={label} checked={form[name]} onChange={handleChange} />)}
                <div className="md:col-span-2 xl:col-span-2"><Field label="Link de vídeo"><Input name="link_video" value={form.link_video} onChange={handleChange} /></Field></div>
                <div className="md:col-span-2 xl:col-span-4"><Field label="Observação geral"><Textarea name="observacao_geral" rows="3" value={form.observacao_geral} onChange={handleChange} /></Field></div>
                <div className="md:col-span-2 xl:col-span-4">
                  {editingId ? (
                    <div className="grid gap-6 xl:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-sm font-semibold text-white">Upload de mídia</div>
                        <p className="mt-1 text-sm text-slate-400">Envie fotos e vídeos deste imóvel.</p>
                        <div className="mt-4 text-slate-300"><UploadMidiaImovel imovelId={editingId} onUpload={handleUploadedMidia} /></div>
                      </div>
                      <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-4">
                        <div className="text-sm font-semibold text-white">Galeria do imóvel</div>
                        <p className="mt-1 text-sm text-slate-400">As mídias ficam vinculadas ao cadastro deste imóvel.</p>
                        <div className="mt-4 text-slate-300"><GaleriaImovel key={reloadMidiaKey} imovelId={editingId} /></div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">Salve o imóvel primeiro para liberar o envio de fotos e vídeos.</div>
                  )}
                </div>
              </SectionCard>
            ) : null}

            {error ? <Alert>{error}</Alert> : null}
            {message ? <Alert type="success">{message}</Alert> : null}

            <div className="sticky bottom-0 border-t border-white/10 bg-[#071526] pt-4">
              <div className="flex flex-wrap justify-between gap-3">
                <div className="text-sm text-slate-400">Troque o tipo do imóvel para abrir automaticamente o bloco específico.</div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                  <Button type="submit">{editingId ? "Atualizar" : "Salvar"}</Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </Layout>
  );
}
