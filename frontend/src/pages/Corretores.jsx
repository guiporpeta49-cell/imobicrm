import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { PageHeader, Button, Field, Input, Select, Alert, DataTable, StatusBadge } from "../components/ui";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { nome: "", email: "", telefone: "", creci: "", senha: "", ativo: true, perfil: "corretor" };

export default function CorretoresPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadItems() {
    try { const response = await api.get("/corretores/"); setItems(response.data); }
    catch (err) { setError(err?.response?.data?.detail || "Erro ao carregar corretores"); }
  }

  useEffect(() => { loadItems(); }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function resetForm() { setForm(initialForm); setEditingId(null); }
  function openNew() { resetForm(); setError(""); setOpenForm(true); }
  function closeModal() { setOpenForm(false); resetForm(); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      if (editingId) {
        await api.put(`/corretores/${editingId}`, form);
        setMessage("Corretor atualizado com sucesso");
      } else {
        await api.post("/corretores/", form);
        setMessage("Corretor cadastrado com sucesso");
      }
      closeModal(); loadItems();
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao salvar corretor");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({ nome: item.nome ?? "", email: item.email ?? "", telefone: item.telefone ?? "", creci: item.creci ?? "", senha: "", ativo: item.ativo ?? true, perfil: item.perfil ?? "corretor" });
    setError(""); setOpenForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir este corretor?")) return;
    try { await api.delete(`/corretores/${id}`); setMessage("Corretor removido com sucesso"); loadItems(); }
    catch (err) { setError(err?.response?.data?.detail || "Erro ao excluir corretor"); }
  }

  return (
    <Layout>
      <PageHeader title="Corretores" subtitle="Gerencie a equipe da empresa." actions={<div className="flex w-full sm:w-auto"><Button className="w-full sm:w-auto" onClick={openNew}>Novo corretor</Button></div>} />
      {error ? <Alert>{error}</Alert> : null}
      {message ? <Alert type="success">{message}</Alert> : null}

      {loading ? <Alert>Carregando...</Alert> : null}
      {(!loading && user?.perfil !== "admin") ? <Navigate to="/clientes" replace /> : null}

      <DataTable columns={["ID", "Nome", "Email", "Telefone", "Perfil", "Ativo", "Ações"]}>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03]">
            <td className="px-4 py-4">{item.id}</td>
            <td className="px-4 py-4 font-medium text-white">{item.nome}</td>
            <td className="px-4 py-4 text-slate-300">{item.email}</td>
            <td className="px-4 py-4 text-slate-300">{item.telefone || "-"}</td>
            <td className="px-4 py-4 text-slate-300">{item.perfil}</td>
            <td className="px-4 py-4"><StatusBadge value={item.ativo ? "ativa" : "inativa"} /></td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => handleEdit(item)}>Editar</Button>
                <Button variant="danger" onClick={() => handleDelete(item.id)}>Excluir</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={openForm} onClose={closeModal} title={editingId ? "Editar corretor" : "Novo corretor"}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Nome"><Input name="nome" value={form.nome} onChange={handleChange} required /></Field>
          <Field label="Email"><Input name="email" type="email" value={form.email} onChange={handleChange} required /></Field>
          <Field label="Telefone"><Input name="telefone" value={form.telefone} onChange={handleChange} /></Field>
          <Field label="CRECI"><Input name="creci" value={form.creci} onChange={handleChange} required /></Field>
          <Field label="Senha"><Input name="senha" type="password" value={form.senha} onChange={handleChange} required /></Field>
          <Field label="Perfil"><Select name="perfil" value={form.perfil} onChange={handleChange}><option value="corretor">Corretor</option><option value="atendente">Atendente</option><option value="admin">Admin</option></Select></Field>
          <div className="md:col-span-2 xl:col-span-3 flex items-center gap-3"><input name="ativo" type="checkbox" checked={form.ativo} onChange={handleChange} /><span className="text-sm text-slate-300">Usuário ativo</span></div>
          {error ? <div className="md:col-span-2 xl:col-span-3"><Alert>{error}</Alert></div> : null}
          <div className="md:col-span-2 xl:col-span-3 flex flex-wrap gap-3"><Button type="submit">{editingId ? "Atualizar" : "Cadastrar"}</Button><Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button></div>
        </form>
      </Modal>
    </Layout>
  );
}
