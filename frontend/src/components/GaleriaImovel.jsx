import { useEffect, useState } from "react";
import api, { buildFileUrl } from "../services/api";

export default function GaleriaImovel({ imovelId }) {
  const [midias, setMidias] = useState([]);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      const response = await api.get(`/imoveis/${imovelId}/midias`);
      setMidias(response.data);
    } catch (err) {
      setErro(err?.response?.data?.detail || "Erro ao carregar mídias");
    }
  }

  useEffect(() => {
    carregar();
  }, [imovelId]);

  if (erro) {
    return <p style={{ color: "red" }}>{erro}</p>;
  }

  if (!midias.length) {
    return <p style={{ color: "#6b7280" }}>Sem mídias cadastradas.</p>;
  }

  return (
    <div>
      <h4 style={{ marginBottom: "8px" }}>Mídias do imóvel</h4>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {midias.map((midia) => (
          <div key={midia.id}>
            {midia.tipo === "foto" ? (
              <img
                src={buildFileUrl(midia.arquivo_url)}
                alt={midia.nome_arquivo}
                style={{ width: "180px", borderRadius: "8px", objectFit: "cover" }}
              />
            ) : (
              <video
                controls
                style={{ width: "220px", borderRadius: "8px" }}
                src={buildFileUrl(midia.arquivo_url)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
