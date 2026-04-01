import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { PageHeader, Button, Field, Input, Select, Alert, DataTable } from "../components/ui";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  nome: "",
  email: "",
  telefone: "",
  interesse: "compra",
  faixa_preco: "",
};

export default function ClientesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { isAdmin } = useAuth();

  async function loadItems() {
    try {
      const response = await api.get("/clientes/");
      setItems(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao carregar clientes");
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function openNew() {
    resetForm();
    setError("");
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
      email: form.email || null,
      telefone: form.telefone || null,
      faixa_preco: form.faixa_preco ? Number(form.faixa_preco) : null,
    };

    try {
      if (editingId) {
        await api.put(`/clientes/${editingId}`, payload);
        setMessage("Cliente atualizado com sucesso");
      } else {
        await api.post("/clientes/", payload);
        setMessage("Cliente cadastrado com sucesso");
      }
      closeModal();
      loadItems();
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao salvar cliente");
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      nome: item.nome ?? "",
      email: item.email ?? "",
      telefone: item.telefone ?? "",
      interesse: item.interesse ?? "compra",
      faixa_preco: item.faixa_preco ?? "",
    });
    setError("");
    setOpenForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir este cliente?")) return;

    try {
      await api.delete(`/clientes/${id}`);
      setMessage("Cliente removido com sucesso");
      loadItems();
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao excluir cliente");
    }
  }

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return items;

    return items.filter((item) =>
      [
        item.nome,
        item.email,
        item.telefone,
        item.interesse,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [items, search]);

  return (
    <Layout>
      <PageHeader
        title="Clientes"
        subtitle="Gerencie o relacionamento comercial com seus clientes."
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full sm:w-72"
            />
            <Button className="w-full sm:w-auto" onClick={openNew}>
              Novo cliente
            </Button>
          </div>
        }
      />

      {error ? <Alert>{error}</Alert> : null}
      {message ? <Alert type="success">{message}</Alert> : null}

      <DataTable columns={["ID", "Nome", "Email", "Telefone", "Interesse", "Faixa", "Ações"]}>
        {filteredItems.map((item) => (
          <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03]">
            <td className="px-4 py-4 text-slate-300">{item.id}</td>
            <td className="px-4 py-4 font-medium text-white">{item.nome}</td>
            <td className="px-4 py-4 text-slate-300">{item.email || "-"}</td>
            <td className="px-4 py-4 text-slate-300">{item.telefone || "-"}</td>
            <td className="px-4 py-4 text-slate-300">{item.interesse}</td>
            <td className="px-4 py-4 text-slate-300">
              {item.faixa_preco
                ? Number(item.faixa_preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "-"}
            </td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => handleEdit(item)}>
                  Editar
                </Button>
                {isAdmin ? (
                  <Button variant="danger" onClick={() => handleDelete(item.id)}>
                    Excluir
                  </Button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {!filteredItems.length ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-slate-400">
          Nenhum cliente encontrado.
        </div>
      ) : null}

      <Modal open={openForm} onClose={closeModal} title={editingId ? "Editar cliente" : "Novo cliente"}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Nome">
            <Input name="nome" value={form.nome} onChange={handleChange} required />
          </Field>

          <Field label="Email">
            <Input name="email" type="email" value={form.email} onChange={handleChange} />
          </Field>

          <Field label="Telefone">
            <Input name="telefone" value={form.telefone} onChange={handleChange} />
          </Field>

          <Field label="Interesse">
            <Select name="interesse" value={form.interesse} onChange={handleChange}>
              <option value="compra">Compra</option>
              <option value="aluguel">Aluguel</option>
            </Select>
          </Field>

          <Field label="Faixa de preço">
            <Input
              name="faixa_preco"
              type="number"
              step="0.01"
              value={form.faixa_preco}
              onChange={handleChange}
            />
          </Field>

          {error ? (
            <div className="md:col-span-2 xl:col-span-3">
              <Alert>{error}</Alert>
            </div>
          ) : null}

          <div className="md:col-span-2 xl:col-span-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">{editingId ? "Atualizar" : "Cadastrar"}</Button>
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}