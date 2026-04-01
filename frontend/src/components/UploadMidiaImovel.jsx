import { useState } from "react";
import api from "../services/api";

export default function UploadMidiaImovel({ imovelId, onUpload }) {
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

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
        onChange={(e) => setArquivo(e.target.files?.[0] || null)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
      />

      {arquivo ? (
        <p className="text-sm text-slate-300">
          Arquivo selecionado: <strong>{arquivo.name}</strong>
        </p>
      ) : null}

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