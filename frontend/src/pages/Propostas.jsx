import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { cliente_id: "", imovel_id: "", valor_ofertado: "", status: "pendente" };

export default function PropostasPage() {
  const [items, setItems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { isAdmin } = useAuth();

  async function loadAll() {
    try {
      const [p, c, i] = await Promise.all([api.get("/propostas/"), api.get("/clientes/"), api.get("/imoveis/")]);
      setItems(p.data); setClientes(c.data); setImoveis(i.data);
    } catch (err) { setError(err?.response?.data?.detail || "Erro ao carregar propostas"); }
  }
  useEffect(() => { loadAll(); }, []);
  function handleChange(e) { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); }
  function resetForm() { setForm(initialForm); setEditingId(null); }
  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setMessage("");
    const payload = { ...form, cliente_id: Number(form.cliente_id), imovel_id: Number(form.imovel_id), valor_ofertado: Number(form.valor_ofertado) };
    try {
      if (editingId) { await api.put(`/propostas/${editingId}`, payload); setMessage("Proposta atualizada com sucesso"); }
      else { await api.post("/propostas/", payload); setMessage("Proposta cadastrada com sucesso"); }
      resetForm(); loadAll();
    } catch (err) { setError(err?.response?.data?.detail || "Erro ao salvar proposta"); }
  }
  function handleEdit(item) { setEditingId(item.id); setForm({ cliente_id: item.cliente_id ?? "", imovel_id: item.imovel_id ?? "", valor_ofertado: item.valor_ofertado ?? "", status: item.status ?? "pendente" }); }
  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir esta proposta?")) return;
    try { await api.delete(`/propostas/${id}`); setMessage("Proposta removida com sucesso"); loadAll(); }
    catch (err) { setError(err?.response?.data?.detail || "Erro ao excluir proposta"); }
  }

  return (
    <Layout>
      <div className="page-header"><div><h1>Propostas</h1></div></div>
      <div className="card">
        <h2 style={{ marginBottom: 16 }}>{editingId ? "Editar proposta" : "Nova proposta"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field"><label>Cliente</label><select name="cliente_id" value={form.cliente_id} onChange={handleChange} required><option value="">Selecione</option>{clientes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
            <div className="field"><label>Imóvel</label><select name="imovel_id" value={form.imovel_id} onChange={handleChange} required><option value="">Selecione</option>{imoveis.map((item) => <option key={item.id} value={item.id}>{item.titulo}</option>)}</select></div>
            <div className="field"><label>Valor ofertado</label><input name="valor_ofertado" type="number" step="0.01" value={form.valor_ofertado} onChange={handleChange} required /></div>
            <div className="field"><label>Status</label><select name="status" value={form.status} onChange={handleChange}><option value="pendente">Pendente</option><option value="aceita">Aceita</option><option value="recusada">Recusada</option></select></div>
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" type="submit">{editingId ? "Atualizar" : "Cadastrar"}</button>
            <button className="btn btn-secondary" type="button" onClick={resetForm}>Limpar</button>
          </div>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Cliente</th><th>Imóvel</th><th>Valor</th><th>Status</th><th>Criado em</th><th>Ações</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{clientes.find((x) => x.id === item.cliente_id)?.nome || item.cliente_id}</td><td>{imoveis.find((x) => x.id === item.imovel_id)?.titulo || item.imovel_id}</td><td>{Number(item.valor_ofertado || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td>{item.status}</td><td>{item.criado_em ? new Date(item.criado_em).toLocaleString("pt-BR") : "-"}</td>
                  <td><div className="actions"><button className="btn btn-secondary" onClick={() => handleEdit(item)}>Editar</button>{isAdmin ? <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Excluir</button> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
