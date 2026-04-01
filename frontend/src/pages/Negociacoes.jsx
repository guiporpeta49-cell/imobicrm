import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { PageHeader, Button, Field, Select, Input, Alert, DataTable, StatusBadge } from "../components/ui";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { cliente_id: "", imovel_id: "", valor_negociado: "", percentual_lucro: "5", status: "em_negociacao" };

export default function NegociacoesPage() {
  const [items, setItems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const { isAdmin, user, loading } = useAuth();

  if (loading) return <Layout><Alert>Carregando...</Alert></Layout>;
  if (user?.perfil === "atendente") return <Navigate to="/clientes" replace />;

  async function loadAll() {
    try {
      const [neg, cli, imo] = await Promise.all([api.get("/negociacoes/"), api.get("/clientes/"), api.get("/imoveis/")]);
      setItems(neg.data); setClientes(cli.data); setImoveis(imo.data);
    } catch (err) { setError(err?.response?.data?.detail || "Erro ao carregar negociações"); }
  }

  useEffect(() => { loadAll(); }, []);
  function handleChange(e) { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); }
  function resetForm() { setForm(initialForm); setEditingId(null); }
  function openNew() { resetForm(); setError(""); setOpenForm(true); }
  function closeModal() { setOpenForm(false); resetForm(); }
  const valorNegociado = Number(form.valor_negociado || 0);
  const percentualLucro = Number(form.percentual_lucro || 0);
  const lucroPrevisto = (valorNegociado * percentualLucro) / 100;

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setMessage("");
    const payload = { cliente_id: Number(form.cliente_id), imovel_id: Number(form.imovel_id), valor_negociado: Number(form.valor_negociado), percentual_lucro: Number(form.percentual_lucro), status: form.status };
    try {
      if (editingId) { await api.put(`/negociacoes/${editingId}`, payload); setMessage("Negociação atualizada com sucesso"); }
      else { await api.post("/negociacoes/", payload); setMessage("Negociação cadastrada com sucesso"); }
      closeModal(); loadAll();
    } catch (err) { setError(err?.response?.data?.detail || "Erro ao salvar negociação"); }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({ cliente_id: item.cliente_id ?? "", imovel_id: item.imovel_id ?? "", valor_negociado: item.valor_negociado ?? "", percentual_lucro: item.percentual_lucro ?? "5", status: item.status ?? "em_negociacao" });
    setError(""); setOpenForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir esta negociação?")) return;
    try { await api.delete(`/negociacoes/${id}`); setMessage("Negociação removida com sucesso"); loadAll(); }
    catch (err) { setError(err?.response?.data?.detail || "Erro ao excluir negociação"); }
  }

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return items;
    return items.filter((item) => [item.status, item.valor_negociado, item.valor_lucro].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)));
  }, [items, search]);

  const nomeCliente = (id) => clientes.find((c) => c.id === id)?.nome || id;
  const tituloImovel = (id) => imoveis.find((i) => i.id === id)?.titulo || id;

  return (
    <Layout>
      <PageHeader title="Negociações" subtitle="Controle comercial com cálculo automático de lucro." actions={<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="sm:w-64" /><Button onClick={openNew}>Nova negociação</Button></div>} />
      {error ? <Alert>{error}</Alert> : null}
      {message ? <Alert type="success">{message}</Alert> : null}

      <DataTable columns={["ID", "Cliente", "Imóvel", "Valor imóvel", "Valor negociado", "% lucro", "Lucro", "Status", "Ações"]}>
        {filteredItems.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <td className="px-4 py-4">{item.id}</td>
            <td className="px-4 py-4">{nomeCliente(item.cliente_id)}</td>
            <td className="px-4 py-4">{tituloImovel(item.imovel_id)}</td>
            <td className="px-4 py-4">{Number(item.valor_imovel).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td className="px-4 py-4">{Number(item.valor_negociado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td className="px-4 py-4">{Number(item.percentual_lucro).toLocaleString("pt-BR")} %</td>
            <td className="px-4 py-4 font-semibold text-emerald-700">{Number(item.valor_lucro).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td className="px-4 py-4"><StatusBadge value={item.status} /></td>
            <td className="px-4 py-4"><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => handleEdit(item)}>Editar</Button>{isAdmin ? <Button variant="danger" onClick={() => handleDelete(item.id)}>Excluir</Button> : null}</div></td>
          </tr>
        ))}
      </DataTable>

      <Modal open={openForm} onClose={closeModal} title={editingId ? "Editar negociação" : "Nova negociação"} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Cliente"><Select name="cliente_id" value={form.cliente_id} onChange={handleChange} required><option value="">Selecione</option>{clientes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</Select></Field>
          <Field label="Imóvel"><Select name="imovel_id" value={form.imovel_id} onChange={handleChange} required><option value="">Selecione</option>{imoveis.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</Select></Field>
          <Field label="Valor negociado"><Input name="valor_negociado" type="number" step="0.01" value={form.valor_negociado} onChange={handleChange} required /></Field>
          <Field label="% lucro/comissão"><Input name="percentual_lucro" type="number" step="0.01" value={form.percentual_lucro} onChange={handleChange} required /></Field>
          <Field label="Status"><Select name="status" value={form.status} onChange={handleChange}><option value="em_negociacao">Em negociação</option><option value="fechada">Fechada</option><option value="cancelada">Cancelada</option></Select></Field>
          <Field label="Lucro previsto"><Input value={lucroPrevisto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} readOnly /></Field>
          {error ? <div className="md:col-span-2 xl:col-span-3"><Alert>{error}</Alert></div> : null}
          <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-3"><Button type="submit">{editingId ? "Atualizar" : "Cadastrar"}</Button><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button></div>
        </form>
      </Modal>
    </Layout>
  );
}
