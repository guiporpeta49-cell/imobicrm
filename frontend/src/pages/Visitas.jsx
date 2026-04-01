import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Button, Field, Input, Select, Textarea, Alert, StatusBadge, Card } from "../components/ui";

const initialForm = {
  tipo: "visita",
  cliente_id: "",
  imovel_id: "",
  data_visita: "",
  status: "agendada",
  observacoes: "",
};

function toDateInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateKey(dateLike) {
  const d = new Date(dateLike);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={onPrev} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">‹</button>
        <div className="text-lg font-semibold text-white">
          {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </div>
        <button onClick={onNext} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">›</button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-slate-400">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={idx} className="h-12 rounded-xl bg-transparent" />;
          const key = dateKey(cell);
          const isSelected = dateKey(selectedDate) === key;
          const hasEvents = Boolean(groupedDates[key]?.length);
          return (
            <button
              key={key}
              onClick={() => onSelectDate(cell)}
              className={`relative h-12 rounded-xl border text-sm transition ${
                isSelected
                  ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                  : "border-white/8 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
              }`}
            >
              {cell.getDate()}
              {hasEvents ? <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400" /> : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function VisitasPage() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const imovelIdFromUrl = searchParams.get("imovel_id");

  const [items, setItems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadItems() {
    try {
      const response = await api.get("/visitas/");
      setItems(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao carregar compromissos");
    }
  }

  async function loadClientes() {
    try {
      const response = await api.get("/clientes/");
      setClientes(response.data);
    } catch {}
  }

  async function loadImoveis() {
    try {
      const response = await api.get("/imoveis/");
      setImoveis(response.data);
    } catch {}
  }

  useEffect(() => {
    loadItems();
    loadClientes();
    loadImoveis();
  }, []);

  useEffect(() => {
    if (imovelIdFromUrl) {
      setForm((prev) => ({ ...prev, imovel_id: imovelIdFromUrl }));
      setOpenForm(true);
    }
  }, [imovelIdFromUrl]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "tipo" && value === "reuniao") next.imovel_id = "";
      return next;
    });
  }

  function resetForm() {
    setForm({
      ...initialForm,
      imovel_id: imovelIdFromUrl || "",
    });
    setEditingId(null);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      ...form,
      cliente_id: Number(form.cliente_id),
      imovel_id: form.tipo === "visita" && form.imovel_id ? Number(form.imovel_id) : null,
    };

    try {
      if (editingId) {
        await api.put(`/visitas/${editingId}`, payload);
        setMessage("Compromisso atualizado com sucesso");
      } else {
        await api.post("/visitas/", payload);
        setMessage("Compromisso criado com sucesso");
      }
      await loadItems();
      closeModal();
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao salvar compromisso");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      tipo: item.tipo || "visita",
      cliente_id: item.cliente_id ?? "",
      imovel_id: item.imovel_id ?? "",
      data_visita: toDateInputValue(item.data_visita),
      status: item.status ?? "agendada",
      observacoes: item.observacoes ?? "",
    });
    setOpenForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir este compromisso?")) return;
    try {
      await api.delete(`/visitas/${id}`);
      setMessage("Compromisso removido com sucesso");
      loadItems();
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao excluir compromisso");
    }
  }

  const groupedDates = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = dateKey(item.data_visita);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

  const selectedDayItems = useMemo(() => {
    const key = dateKey(selectedDate);
    return (groupedDates[key] || []).slice().sort((a, b) => new Date(a.data_visita) - new Date(b.data_visita));
  }, [groupedDates, selectedDate]);

  return (
    <Layout>
      <PageHeader
        title="Visitas e reuniões"
        subtitle="Veja sua agenda no calendário e acompanhe os compromissos do dia."
        actions={<Button onClick={openNew}>Novo compromisso</Button>}
      />

      {error ? <Alert>{error}</Alert> : null}
      {message ? <Alert type="success">{message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Calendar
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          groupedDates={groupedDates}
          onSelectDate={setSelectedDate}
          onPrev={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          onNext={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
        />

        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xl font-semibold text-white">
                {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </div>
              <div className="text-sm text-slate-400">Compromissos agendados para este dia</div>
            </div>
            <Button onClick={openNew}>Novo</Button>
          </div>

          <div className="space-y-3">
            {selectedDayItems.length ? selectedDayItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {new Date(item.data_visita).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      {" • "}
                      {item.tipo === "reuniao" ? "Reunião" : "Visita"}
                    </div>
                    <div className="mt-2 text-sm text-slate-300">Cliente #{item.cliente_id}</div>
                    {item.tipo === "visita" ? <div className="mt-1 text-sm text-slate-400">Imóvel #{item.imovel_id}</div> : null}
                    {item.observacoes ? <div className="mt-2 text-sm text-slate-400">{item.observacoes}</div> : null}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <StatusBadge value={item.status} />
                    <Button variant="secondary" onClick={() => handleEdit(item)}>Editar</Button>
                    {isAdmin ? <Button variant="danger" onClick={() => handleDelete(item.id)}>Excluir</Button> : null}
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
                Nenhum compromisso para este dia.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal open={openForm} onClose={closeModal} title={editingId ? "Editar compromisso" : "Novo compromisso"} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Field label="Tipo">
            <Select name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="visita">Visita</option>
              <option value="reuniao">Reunião</option>
            </Select>
          </Field>

          <Field label="Cliente">
            <Select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
              <option value="">Selecione</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </Select>
          </Field>

          {form.tipo === "visita" ? (
            <Field label="Imóvel">
              <Select name="imovel_id" value={form.imovel_id} onChange={handleChange} required>
                <option value="">Selecione</option>
                {imoveis.map((i) => (
                  <option key={i.id} value={i.id}>{i.titulo}</option>
                ))}
              </Select>
            </Field>
          ) : null}

          <Field label="Data e hora">
            <Input type="datetime-local" name="data_visita" value={form.data_visita} onChange={handleChange} required />
          </Field>

          <Field label="Status">
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </Select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Observações">
              <Textarea name="observacoes" rows="4" value={form.observacoes} onChange={handleChange} />
            </Field>
          </div>

          <div className="md:col-span-2 border-t border-white/10 pt-4">
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button type="submit">{editingId ? "Atualizar" : "Salvar"}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
