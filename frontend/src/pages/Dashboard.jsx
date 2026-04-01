import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { Alert, Button, Card, MetricCard, PageHeader, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";

function dateKey(dateLike) {
  const d = new Date(dateLike);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function money(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Calendar({ currentMonth, selectedDate, groupedDates, onSelectDate, onPrev, onNext }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));

  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <button onClick={onPrev} className="btn">‹</button>
        <div className="text-base font-semibold capitalize text-white">
          {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </div>
        <button onClick={onNext} className="btn">›</button>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="h-12" />;

          const key = dateKey(cell);
          const has = groupedDates[key]?.length;
          const isSelected = dateKey(selectedDate) === key;

          return (
            <button
              key={key}
              onClick={() => onSelectDate(cell)}
              className={`relative h-12 rounded-2xl border text-sm transition ${
                isSelected
                  ? "border-cyan-400/35 bg-cyan-500/12 text-cyan-200"
                  : "border-white/8 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              }`}
            >
              {cell.getDate()}
              {has ? <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400" /> : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [imoveis, setImoveis] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [negociacoes, setNegociacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());

  async function load() {
    try {
      const requests = [
        api.get("/imoveis/"),
        api.get("/visitas/"),
        api.get("/negociacoes/"),
        api.get("/clientes/"),
      ];

      const [i, v, n, c] = await Promise.all(requests);

      setImoveis(i.data || []);
      setVisitas(v.data || []);
      setNegociacoes(n.data || []);
      setClientes(c.data || []);
    } catch {
      setError("Erro ao carregar dados do dashboard");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    return visitas.reduce((acc, v) => {
      const k = dateKey(v.data_visita);
      if (!acc[k]) acc[k] = [];
      acc[k].push(v);
      return acc;
    }, {});
  }, [visitas]);

  const hoje = dateKey(new Date());
  const hojeLista = grouped[hoje] || [];
  const diaSelecionado = grouped[dateKey(selectedDate)] || [];

  const totalImoveis = useMemo(
  () =>
    imoveis.reduce((a, i) => {
      const valor =
        String(i.finalidade || "").toLowerCase() === "aluguel"
          ? Number(i.valor_locacao || 0)
          : Number(i.valor_venda || i.valor_locacao || 0);

      return a + valor;
    }, 0),
  [imoveis]
  );
  const totalNegociacoes = useMemo(() => negociacoes.reduce((a, n) => a + Number(n.valor_negociado || 0), 0), [negociacoes]);
  const totalComissao = useMemo(() => negociacoes.reduce((a, n) => a + Number(n.valor_lucro || 0), 0), [negociacoes]);

  const imoveisDisponiveis = useMemo(() => imoveis.filter((i) => String(i.status).toLowerCase() === "disponivel").length, [imoveis]);
  const negociacoesFechadas = useMemo(() => negociacoes.filter((n) => String(n.status).toLowerCase() === "fechada").length, [negociacoes]);

  const proximosCompromissos = useMemo(() => {
    const agora = new Date();
    return [...visitas]
      .filter((item) => new Date(item.data_visita) >= agora)
      .sort((a, b) => new Date(a.data_visita) - new Date(b.data_visita))
      .slice(0, 5);
  }, [visitas]);

  const ultimosImoveis = useMemo(() => [...imoveis].slice(-5).reverse(), [imoveis]);

  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        subtitle="Resumo financeiro, agenda do dia e visão operacional da empresa em um painel mais claro e profissional."
        badge="visão geral"
        actions={
          <>
            <Button onClick={() => navigate("/visitas")}>Agenda</Button>
            {user?.perfil !== "atendente" ? <Button variant="success" onClick={() => navigate("/negociacoes")}>Negociações</Button> : null}
            {String(user?.perfil).toLowerCase() === "admin" ? <Button variant="secondary" onClick={() => navigate("/corretores")}>Corretores</Button> : null}
          </>
        }
      />

      <div className="mb-6 space-y-3">
        {error ? <Alert>{error}</Alert> : null}
        {hojeLista.length > 0 ? (
          <Alert type="warning">
            Você tem {hojeLista.length} compromisso(s) hoje. Abra a agenda para acompanhar os horários do dia.
          </Alert>
        ) : (
          <Alert type="success">Nenhum compromisso agendado para hoje.</Alert>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard title="Carteira de imóveis" value={money(totalImoveis)} hint={`${imoveis.length} imóvel(is) cadastrado(s)`} tone="cyan" />
        <MetricCard title="Valor em negociação" value={money(totalNegociacoes)} hint={`${negociacoes.length} negociação(ões)`} tone="emerald" />
        <MetricCard title="Comissão prevista" value={money(totalComissao)} hint={`${negociacoesFechadas} negociação(ões) fechada(s)`} tone="amber" />
        <MetricCard title="Compromissos de hoje" value={hojeLista.length} hint="visitas e reuniões do dia" tone="violet" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard title="Imóveis disponíveis" value={imoveisDisponiveis} hint="prontos para oferta" tone="emerald" />
        <MetricCard title="Negociações fechadas" value={negociacoesFechadas} hint="histórico já concluído" tone="cyan" />
        <MetricCard title="Clientes cadastrados" value={clientes.length} hint="base comercial ativa" tone="violet" />
        <MetricCard title="Visitas registradas" value={visitas.length} hint="agenda consolidada" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[430px_1fr]">
        <Calendar
          currentMonth={month}
          selectedDate={selectedDate}
          groupedDates={grouped}
          onSelectDate={setSelectedDate}
          onPrev={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          onNext={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        />

        <Card>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Agenda do dia selecionado</h2>
              <p className="mt-1 text-sm text-slate-400">
                {selectedDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/visitas")}>Abrir agenda</Button>
          </div>

          <div className="space-y-3">
            {diaSelecionado.length ? diaSelecionado.map((v) => (
              <div key={v.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {new Date(v.data_visita).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {v.tipo || "compromisso"}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">Cliente #{v.cliente_id || "-"}</div>
                    {v.imovel_id ? <div className="mt-1 text-sm text-slate-400">Imóvel #{v.imovel_id}</div> : null}
                  </div>
                  <StatusBadge value={v.status || "agendada"} />
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
                Nenhum compromisso para esta data.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Próximos compromissos</h2>
              <p className="mt-1 text-sm text-slate-400">Visão rápida das próximas visitas e reuniões.</p>
            </div>
            <Button variant="ghost" onClick={() => navigate("/visitas")}>Ver tudo</Button>
          </div>

          <div className="space-y-3">
            {proximosCompromissos.length ? proximosCompromissos.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-sm font-semibold text-white">
                  {new Date(item.data_visita).toLocaleDateString("pt-BR")} às {new Date(item.data_visita).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  {item.tipo || "compromisso"} • Cliente #{item.cliente_id || "-"}
                </div>
                <div className="mt-2">
                  <StatusBadge value={item.status || "agendada"} />
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
                Não há compromissos futuros no momento.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Últimos imóveis cadastrados</h2>
              <p className="mt-1 text-sm text-slate-400">Acesso rápido aos imóveis adicionados recentemente.</p>
            </div>
            <Button variant="ghost" onClick={() => navigate("/imoveis")}>Abrir imóveis</Button>
          </div>

          <div className="space-y-3">
            {ultimosImoveis.length ? ultimosImoveis.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{item.titulo}</div>
                    <div className="mt-1 text-sm text-slate-400">{item.cidade || "-"} • {item.tipo || "-"}</div>
                    <div className="mt-2 text-sm text-slate-300">{money(item.valor)}</div>
                  </div>
                  <StatusBadge value={item.status || "disponivel"} />
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
                Nenhum imóvel cadastrado ainda.
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
