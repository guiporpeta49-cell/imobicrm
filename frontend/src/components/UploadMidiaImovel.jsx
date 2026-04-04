import { useState } from "react";
import api from "../services/api";

const MAX_UPLOAD_SIZE_MB = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB || 20);
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export default function UploadMidiaImovel({ imovelId, onUpload }) {
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setErro("");
    setSucesso("");

    if (file && file.size > MAX_UPLOAD_SIZE_BYTES) {
      setArquivo(null);
      e.target.value = "";
      setErro(`O arquivo excede o limite de ${MAX_UPLOAD_SIZE_MB}MB.`);
      return;
    }

    setArquivo(file);
  }

  async function handleUpload(e) {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!imovelId) {
      setErro("Imóvel sem ID para vincular a mídia.");
      return;
    }

    if (!arquivo) {
      setErro("Selecione um arquivo.");
      return;
    }

    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      const formData = new FormData();
      formData.append("arquivo", arquivo);

      const response = await api.post(`/imoveis/${imovelId}/midias`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSucesso("Mídia enviada com sucesso.");
      setArquivo(null);

      const input = document.getElementById(`upload-imovel-${imovelId}`);
      if (input) input.value = "";

      if (onUpload) onUpload(response.data);
    } catch (err) {
      setErro(err?.response?.data?.detail || "Erro ao enviar arquivo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        id={`upload-imovel-${imovelId}`}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
      />

      {arquivo ? (
        <p className="text-sm text-slate-300">
          Arquivo selecionado: <strong>{arquivo.name}</strong>
        </p>
      ) : null}

      <p className="text-xs text-slate-400">
        Tamanho máximo permitido: {MAX_UPLOAD_SIZE_MB}MB.
      </p>

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading}
        className="rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-70"
      >
        {loading ? "Enviando..." : "Enviar mídia"}
      </button>

      {erro ? <p className="text-sm text-red-300">{erro}</p> : null}
      {sucesso ? <p className="text-sm text-emerald-300">{sucesso}</p> : null}
    </div>
  );
}
