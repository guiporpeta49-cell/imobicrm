import { useEffect, useMemo, useState } from "react";

export function useCrudPage({
  listFn,
  saveFn,
  deleteFn,
  searchFields,
  normalizePayload,
  editMapper,
  successCreate,
  successUpdate,
  successDelete,
}) {
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadItems() {
    setLoadingList(true);
    setError("");
    try {
      const data = await listFn();
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Erro ao carregar dados");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function save(form) {
    setLoadingSave(true);
    setError("");
    setMessage("");

    try {
      const payload = normalizePayload ? normalizePayload(form) : form;
      await saveFn(editingId, payload);
      setMessage(editingId ? successUpdate : successCreate);
      setEditingId(null);
      await loadItems();
      return true;
    } catch (err) {
      const detail = err?.response?.data?.detail || "Erro ao salvar";
      setError(detail);
      return false;
    } finally {
      setLoadingSave(false);
    }
  }

  async function remove(id) {
    const confirmed = window.confirm("Deseja excluir este registro?");
    if (!confirmed) return false;

    setError("");
    setMessage("");

    try {
      await deleteFn(id);
      setMessage(successDelete);
      if (editingId === id) setEditingId(null);
      await loadItems();
      return true;
    } catch (err) {
      const detail = err?.response?.data?.detail || "Erro ao excluir";
      setError(detail);
      return false;
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setError("");
    setMessage("");
    return editMapper ? editMapper(item) : item;
  }

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value !== null && value !== undefined && String(value).toLowerCase().includes(term);
      })
    );
  }, [items, search, searchFields]);

  return {
    items,
    filteredItems,
    loadingList,
    loadingSave,
    error,
    message,
    search,
    setSearch,
    editingId,
    setEditingId,
    save,
    remove,
    startEdit,
    loadItems,
    setMessage,
    setError,
  };
}
