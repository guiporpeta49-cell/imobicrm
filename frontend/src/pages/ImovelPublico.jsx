import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api, { API_BASE_URL } from "../services/api";

function fmtCurrency(value) {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function valorOuTraco(value) {
  return value !== null && value !== undefined && value !== "" ? value : "-";
}

function enderecoCompleto(imovel) {
  return [
    imovel?.rua,
    imovel?.numero,
    imovel?.complemento,
    imovel?.bairro,
    imovel?.cidade,
    imovel?.estado,
    imovel?.cep,
  ]
    .filter(Boolean)
    .join(", ");
}

function isTipoFazenda(imovel) {
  const tipo = String(imovel?.tipo || "").trim().toLowerCase();
  return ["fazenda", "sitio", "sítio", "chacara", "chácara", "rural"].includes(tipo);
}

function getMapaSrc(imovel) {
  const isFazenda = isTipoFazenda(imovel);

  if (isFazenda && imovel?.link_maps) {
    const link = String(imovel.link_maps).trim();

    if (link.includes("/maps/embed")) {
      return link;
    }

    return `https://www.google.com/maps?q=${encodeURIComponent(link)}&output=embed`;
  }

  if (imovel?.latitude && imovel?.longitude) {
    return `https://www.google.com/maps?q=${imovel.latitude},${imovel.longitude}&z=14&output=embed`;
  }

  const endereco = enderecoCompleto(imovel);

  if (isFazenda) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      imovel?.municipio || imovel?.cidade || "Brasil"
    )}&output=embed`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(
    endereco || imovel?.cidade || "Brasil"
  )}&output=embed`;
}

function getMapaLink(imovel) {
  const isFazenda = isTipoFazenda(imovel);

  if (isFazenda && imovel?.link_maps) {
    return imovel.link_maps;
  }

  if (imovel?.latitude && imovel?.longitude) {
    return `https://www.google.com/maps?q=${imovel.latitude},${imovel.longitude}`;
  }

  const endereco = enderecoCompleto(imovel);

  if (isFazenda) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      imovel?.municipio || imovel?.cidade || "Brasil"
    )}`;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(
    endereco || imovel?.cidade || "Brasil"
  )}`;
}

function Campo({ label, value, destaque = false, icon = "•" }) {
  if (value === null || value === undefined || value === "" || value === false) {
    return null;
  }

  return (
    <div
      style={{
        background: destaque
          ? "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(15,23,42,0.85))"
          : "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(15,23,42,0.88))",
        border: destaque
          ? "1px solid rgba(34,197,94,0.25)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 18,
        transition: "all 0.25s ease",
        cursor: "default",
        boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
        backdropFilter: "blur(10px)",
        minWidth: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 22px 50px rgba(0,0,0,0.28)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.22)";
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: destaque ? "#bbf7d0" : "#94a3b8",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 700,
          flexWrap: "wrap",
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.5,
          color: "#ffffff",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {valorOuTraco(value)}
      </div>
    </div>
  );
}

function Secao({ title, subtitle, children, destaque = false }) {
  return (
    <section
      style={{
        background: destaque
          ? "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(2,6,23,0.94))"
          : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(15,23,42,0.9))",
        border: destaque
          ? "1px solid rgba(59,130,246,0.16)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 28,
        padding: 28,
        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 25,
            color: "#fff",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>

        {subtitle ? (
          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              color: "#94a3b8",
              lineHeight: 1.7,
              fontSize: 15,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status, mobile = false }) {
  const texto = valorOuTraco(status).toUpperCase();

  const isDisponivel =
    String(status || "")
      .toLowerCase()
      .includes("dispon") || String(status || "").toLowerCase().includes("venda");

  return (
    <div
      style={{
        position: mobile ? "static" : "absolute",
        top: mobile ? "auto" : 22,
        right: mobile ? "auto" : 22,
        zIndex: 5,
        padding: "10px 16px",
        borderRadius: 999,
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: 0.8,
        color: "#fff",
        background: isDisponivel
          ? "linear-gradient(135deg, rgba(34,197,94,0.92), rgba(22,163,74,0.92))"
          : "linear-gradient(135deg, rgba(59,130,246,0.92), rgba(29,78,216,0.92))",
        boxShadow: "0 12px 25px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.16)",
        backdropFilter: "blur(8px)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: mobile ? "fit-content" : "auto",
      }}
    >
      {texto}
    </div>
  );
}

function CardResumo({ label, value, icon = "•" }) {
  if (value === null || value === undefined || value === "" || value === false) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "14px 16px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#94a3b8",
          marginBottom: 8,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{value}</div>
    </div>
  );
}

export default function ImovelPublico() {
  const { token } = useParams();
  const [imovel, setImovel] = useState(null);
  const [midias, setMidias] = useState([]);
  const [selected, setSelected] = useState(null);
  const [erro, setErro] = useState("");
  const [openPreview, setOpenPreview] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res1 = await api.get(`/imoveis/publico/imovel/${token}`);
        const res2 = await api.get(`/imoveis/publico/imovel/${token}/midias`);

        setImovel(res1.data);
        setMidias(res2.data || []);

        if (res2.data?.length) {
          setSelected(res2.data[0]);
        }
      } catch (err) {
        setErro(err?.response?.data?.detail || "Erro ao carregar imóvel");
      }
    }

    load();
  }, [token]);

  const tipoNormalizado = String(imovel?.tipo || "")
    .trim()
    .toLowerCase();

  const isFazenda = useMemo(() => isTipoFazenda(imovel), [imovel]);

  const precoPrincipal = useMemo(() => {
    if (!imovel) return "-";
    if (imovel.finalidade === "aluguel" && imovel.valor_locacao) return fmtCurrency(imovel.valor_locacao);
    if (imovel.valor_venda) return fmtCurrency(imovel.valor_venda);
    if (imovel.valor_locacao) return fmtCurrency(imovel.valor_locacao);
    return "-";
  }, [imovel]);

  const linkAtual = typeof window !== "undefined" ? window.location.href : "";
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`Veja este imóvel: ${linkAtual}`)}`;
  const pdfLink = `${API_BASE_URL}/imoveis/publico/imovel/${token}/pdf`;
  const mapsLink = getMapaLink(imovel);

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth < 1024;

  const heroHeight = isMobile ? 300 : isTablet ? 420 : 560;
  const camposGridColumns = isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))";
  const resumoGridColumns = isMobile
    ? "1fr"
    : viewportWidth < 1200
    ? "repeat(2, minmax(0, 1fr))"
    : "repeat(auto-fit, minmax(180px, 1fr))";

  const diferenciais = [
    imovel?.tem_piscina && "Piscina",
    imovel?.tem_churrasqueira && "Churrasqueira",
    imovel?.tem_portao_eletronico && "Portão eletrônico",
    imovel?.tem_ar_condicionado && "Ar-condicionado",
    imovel?.tem_armarios && "Armários planejados",
    imovel?.tem_cerca_eletrica && "Cerca elétrica",
    imovel?.aceita_permuta && "Aceita permuta",
    imovel?.aceita_financiamento && "Aceita financiamento",
  ].filter(Boolean);

  if (erro) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #020617, #0f172a)",
          color: "#fff",
          padding: 40,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: 28 }}>Erro</h1>
        <p style={{ color: "#cbd5e1" }}>{erro}</p>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #020617, #0f172a)",
          color: "#fff",
          padding: 40,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        Carregando imóvel...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(30,41,59,0.65), rgba(8,17,31,1)), linear-gradient(180deg, #020617, #020617)",
        color: "#fff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        animation: "fadeIn 0.5s ease",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        {selected ? (
          selected.tipo === "foto" ? (
            <img
              src={`${API_BASE_URL}${selected.arquivo_url}`}
              alt={selected.nome_arquivo}
              onClick={() => setOpenPreview(true)}
              style={{
                width: "100%",
                height: heroHeight,
                objectFit: "cover",
                display: "block",
                cursor: "pointer",
              }}
            />
          ) : (
            <video
              controls
              src={`${API_BASE_URL}${selected.arquivo_url}`}
              style={{
                width: "100%",
                height: heroHeight,
                objectFit: "cover",
                display: "block",
                background: "#000",
              }}
            />
          )
        ) : (
          <div style={{ width: "100%", height: heroHeight, background: "#0f172a" }} />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(2,6,23,0.98), rgba(2,6,23,0.6), rgba(2,6,23,0.18))",
            backdropFilter: "blur(4px)",
            pointerEvents: "none",
          }}
        />

        {!isMobile ? <StatusBadge status={imovel.status} /> : null}

        <div
          style={{
            position: "absolute",
            left: isMobile ? 16 : 24,
            right: isMobile ? 16 : 24,
            bottom: isMobile ? 16 : 30,
            display: "flex",
            flexDirection: isTablet ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isTablet ? "stretch" : "flex-end",
            gap: 20,
          }}
        >
          <div style={{ maxWidth: isTablet ? "100%" : 820 }}>
            {isMobile ? (
              <div style={{ marginBottom: 12 }}>
                <StatusBadge status={imovel.status} mobile />
              </div>
            ) : null}

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 15px",
                borderRadius: 999,
                background: isFazenda
                  ? "rgba(22,163,74,0.18)"
                  : "rgba(37,99,235,0.18)",
                border: isFazenda
                  ? "1px solid rgba(34,197,94,0.28)"
                  : "1px solid rgba(96,165,250,0.28)",
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 16,
                letterSpacing: 0.8,
                backdropFilter: "blur(10px)",
                flexWrap: "wrap",
              }}
            >
              {isFazenda ? "🌱 IMÓVEL RURAL" : "🏠 IMÓVEL"}
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 28 : isTablet ? 38 : 52,
                fontWeight: 900,
                letterSpacing: isMobile ? "-0.5px" : "-1.2px",
                lineHeight: 1.08,
                textShadow: "0 10px 35px rgba(0,0,0,0.38)",
              }}
            >
              {valorOuTraco(imovel.titulo)}
            </h1>

            <p
              style={{
                marginTop: 14,
                marginBottom: 0,
                color: "#cbd5e1",
                fontSize: isMobile ? 14 : 17,
                lineHeight: 1.7,
                maxWidth: 760,
              }}
            >
              {isFazenda
                ? valorOuTraco(imovel.nome_fazenda || imovel.municipio || imovel.cidade)
                : `${valorOuTraco(imovel.cidade)}${imovel.bairro ? ` • ${imovel.bairro}` : ""}${imovel.rua ? ` • ${imovel.rua}` : ""}${imovel.numero ? `, ${imovel.numero}` : ""}`}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: resumoGridColumns,
                gap: 10,
                marginTop: 18,
                maxWidth: isTablet ? "100%" : 900,
              }}
            >
              <CardResumo label="Tipo" value={imovel.tipo} icon="🏷️" />
              <CardResumo label="Finalidade" value={imovel.finalidade} icon="📋" />
              <CardResumo label="Quartos" value={imovel.quartos} icon="🛏️" />
              <CardResumo label="Banheiros" value={imovel.banheiros} icon="🚿" />
              {imovel.suites ? <CardResumo label="Suítes" value={imovel.suites} icon="✨" /> : null}
              {imovel.vagas_cobertas || imovel.vagas_descobertas ? (
                <CardResumo
                  label="Vagas"
                  value={`${imovel.vagas_cobertas || 0} cob. / ${imovel.vagas_descobertas || 0} desc.`}
                  icon="🚗"
                />
              ) : null}
            </div>
          </div>

          <div
            style={{
              width: isTablet ? "100%" : "auto",
              minWidth: isTablet ? "100%" : 300,
              maxWidth: isTablet ? "100%" : 380,
              background: "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(2,6,23,0.92))",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              borderRadius: 26,
              padding: isMobile ? 18 : 24,
              boxShadow: "0 28px 80px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>
              Valor do imóvel
            </div>

            <div
              style={{
                fontSize: isMobile ? 30 : 38,
                fontWeight: 900,
                color: isFazenda ? "#86efac" : "#93c5fd",
                lineHeight: 1.08,
                letterSpacing: "-1px",
                wordBreak: "break-word",
              }}
            >
              {precoPrincipal}
            </div>

            {imovel.valor_iptu ? (
              <div style={{ marginTop: 10, fontSize: 14, color: "#cbd5e1" }}>
                IPTU: <strong>{fmtCurrency(imovel.valor_iptu)}</strong>
              </div>
            ) : null}

            {imovel.valor_condominio ? (
              <div style={{ marginTop: 6, fontSize: 14, color: "#cbd5e1" }}>
                Condomínio: <strong>{fmtCurrency(imovel.valor_condominio)}</strong>
              </div>
            ) : null}

            <div
              style={{
                marginTop: 10,
                background: "rgba(22,163,74,0.14)",
                border: "1px solid rgba(34,197,94,0.24)",
                borderRadius: 12,
                padding: "9px 12px",
                fontSize: 13,
                fontWeight: 700,
                color: "#86efac",
              }}
            >
              🔥 Excelente oportunidade de investimento
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              💰 Consulte condições e possibilidade de negociação
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button
                  type="button"
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 16,
                    padding: "14px 18px",
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: 15,
                    boxShadow: "0 14px 30px rgba(22,163,74,0.25)",
                  }}
                >
                  Compartilhar no WhatsApp
                </button>
              </a>

              <a
                href={pdfLink}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button
                  type="button"
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 16,
                    padding: "14px 18px",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: 15,
                    boxShadow: "0 14px 30px rgba(37,99,235,0.25)",
                  }}
                >
                  Gerar PDF
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? 16 : 32 }}>
        {midias.length > 0 ? (
          <Secao
            title="Galeria do imóvel"
            subtitle="Clique em uma imagem para destacar ou ampliar em tela cheia."
            destaque
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, minmax(0, 1fr))"
                  : "repeat(auto-fill, minmax(170px, 1fr))",
                gap: 14,
              }}
            >
              {midias.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelected(m);
                    if (m.tipo === "foto") setOpenPreview(true);
                  }}
                  style={{
                    padding: 0,
                    border:
                      selected?.id === m.id
                        ? "2px solid #38bdf8"
                        : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 18,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "transparent",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
                    transition: "all 0.22s ease",
                    transform: selected?.id === m.id ? "scale(1.04)" : "scale(1)",
                    filter: selected?.id === m.id ? "brightness(1.05)" : "brightness(0.92)",
                  }}
                >
                  {m.tipo === "foto" ? (
                    <img
                      src={`${API_BASE_URL}${m.arquivo_url}`}
                      alt={m.nome_arquivo}
                      style={{
                        width: "100%",
                        height: isMobile ? 110 : 130,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <video
                      src={`${API_BASE_URL}${m.arquivo_url}`}
                      style={{
                        width: "100%",
                        height: isMobile ? 110 : 130,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </Secao>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 24 }}>
          <Secao
            title="Descrição"
            subtitle="Resumo completo do imóvel e seus principais diferenciais."
          >
            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.9,
                fontSize: 16,
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {valorOuTraco(imovel.descricao)}
            </p>
          </Secao>

          <Secao
            title="Informações do imóvel"
            subtitle="Dados principais e características gerais."
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: camposGridColumns,
                gap: 16,
              }}
            >
              <Campo label="Tipo" value={imovel.tipo} icon="🏷️" />
              <Campo label="Finalidade" value={imovel.finalidade} icon="📋" />
              <Campo label="Status" value={imovel.status} icon="✅" />
              <Campo label="Quartos" value={imovel.quartos} icon="🛏️" />
              <Campo label="Suítes" value={imovel.suites} icon="✨" />
              <Campo label="Banheiros" value={imovel.banheiros} icon="🚿" />
              <Campo label="Vagas cobertas" value={imovel.vagas_cobertas} icon="🚗" />
              <Campo label="Vagas descobertas" value={imovel.vagas_descobertas} icon="🚙" />
              <Campo label="Área construída" value={imovel.area_construida ? `${imovel.area_construida} m²` : null} icon="📐" />
              <Campo label="Área do terreno" value={imovel.area_terreno ? `${imovel.area_terreno} m²` : null} icon="📏" />
              {!isFazenda ? (
                <Campo label="Endereço" value={enderecoCompleto(imovel)} icon="🛣️" />
              ) : (
                <Campo label="Link do Maps" value={imovel.link_maps} icon="📍" />
              )}
              <Campo label="Referência" value={imovel.referencia_local} icon="📌" />
            </div>
          </Secao>

          {tipoNormalizado === "casa" ? (
            <Secao title="Detalhes da casa" subtitle="Características específicas deste imóvel.">
              <div style={{ display: "grid", gridTemplateColumns: camposGridColumns, gap: 16 }}>
                <Campo label="Tipo da casa" value={imovel.casa_tipo} icon="🏠" />
                <Campo label="Sala de estar" value={imovel.sala_estar ? "Sim" : null} icon="🛋️" />
                <Campo label="Sala de jantar" value={imovel.sala_jantar ? "Sim" : null} icon="🍽️" />
                <Campo label="Copa" value={imovel.copa ? "Sim" : null} icon="☕" />
                <Campo label="Cozinha" value={imovel.cozinha ? "Sim" : null} icon="🍳" />
                <Campo label="Área livre / quintal" value={imovel.area_livre ? `${imovel.area_livre} m²` : null} icon="🌿" />
              </div>
            </Secao>
          ) : null}

          {tipoNormalizado === "apartamento" ? (
            <Secao title="Detalhes do apartamento" subtitle="Estrutura e itens do condomínio.">
              <div style={{ display: "grid", gridTemplateColumns: camposGridColumns, gap: 16 }}>
                <Campo label="Número do AP" value={imovel.ap_numero} icon="🏢" />
                <Campo label="Bloco" value={imovel.ap_bloco} icon="🧱" />
                <Campo label="Andar" value={imovel.ap_andar} icon="🔢" />
                <Campo label="Condomínio" value={imovel.valor_condominio ? fmtCurrency(imovel.valor_condominio) : null} icon="💰" />
                <Campo label="Elevador" value={imovel.tem_elevador ? "Sim" : null} icon="⬆️" />
                <Campo label="Vagas demarcadas" value={imovel.vagas_demarcadas ? "Sim" : null} icon="🚘" />
                <Campo label="Academia" value={imovel.cond_academia ? "Sim" : null} icon="🏋️" />
                <Campo label="Salão de festas" value={imovel.cond_salao_festas ? "Sim" : null} icon="🎉" />
                <Campo label="Piscina do condomínio" value={imovel.cond_piscina ? "Sim" : null} icon="🏊" />
                <Campo label="Portaria 24h" value={imovel.cond_portaria_24h ? "Sim" : null} icon="🛡️" />
              </div>
            </Secao>
          ) : null}

          {tipoNormalizado === "terreno" ? (
            <Secao title="Detalhes do terreno" subtitle="Topografia, dimensões e infraestrutura.">
              <div style={{ display: "grid", gridTemplateColumns: camposGridColumns, gap: 16 }}>
                <Campo label="Topografia" value={imovel.topografia} icon="⛰️" />
                <Campo label="Frente" value={imovel.frente ? `${imovel.frente} m` : null} icon="📏" />
                <Campo label="Fundo" value={imovel.fundo ? `${imovel.fundo} m` : null} icon="📏" />
                <Campo label="Lateral esquerda" value={imovel.lateral_esquerda ? `${imovel.lateral_esquerda} m` : null} icon="📐" />
                <Campo label="Lateral direita" value={imovel.lateral_direita ? `${imovel.lateral_direita} m` : null} icon="📐" />
                <Campo label="Zoneamento" value={imovel.zoneamento} icon="🗺️" />
                <Campo label="Asfalto" value={imovel.possui_asfalto ? "Sim" : null} icon="🛣️" />
                <Campo label="Luz" value={imovel.possui_luz ? "Sim" : null} icon="💡" />
                <Campo label="Esgoto" value={imovel.possui_esgoto ? "Sim" : null} icon="🚰" />
                <Campo label="Água encanada" value={imovel.possui_agua_encanada ? "Sim" : null} icon="🚿" />
              </div>
            </Secao>
          ) : null}

          {isFazenda ? (
            <Secao
              title="Destaques rurais"
              subtitle="Bloco especial com foco na análise da fazenda."
              destaque
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: camposGridColumns,
                  gap: 16,
                }}
              >
                <Campo label="Nome da fazenda" value={imovel.nome_fazenda} destaque icon="🌾" />
                <Campo label="Município" value={imovel.municipio} destaque icon="🏙️" />
                <Campo label="Área total em hectares" value={imovel.area_total_hectares} destaque icon="🌱" />
                <Campo label="Área total em alqueires" value={imovel.area_total_alqueires} destaque icon="📐" />
                <Campo label="Área agricultável" value={imovel.area_agricultavel} destaque icon="🚜" />
                <Campo label="Área de pastagem" value={imovel.area_pastagem} destaque icon="🐄" />
                <Campo label="Área inaproveitável" value={imovel.area_inaproveitavel} destaque icon="📉" />
                <Campo
                  label="Distância do asfalto"
                  value={imovel.distancia_asfalto_km ? `${imovel.distancia_asfalto_km} km` : null}
                  destaque
                  icon="🛣️"
                />
                <Campo
                  label="Distância da cidade"
                  value={imovel.distancia_cidade_km ? `${imovel.distancia_cidade_km} km` : null}
                  destaque
                  icon="🏙️"
                />
                <Campo label="Rio" value={imovel.possui_rio ? "Sim" : null} destaque icon="🌊" />
                <Campo label="Nascente" value={imovel.possui_nascente ? "Sim" : null} destaque icon="💧" />
                <Campo label="Poço artesiano" value={imovel.possui_poco_artesiano ? "Sim" : null} destaque icon="🚰" />
                <Campo label="Curral" value={imovel.possui_curral ? "Sim" : null} destaque icon="🐂" />
                <Campo label="Casa de caseiro" value={imovel.possui_casa_caseiro ? "Sim" : null} destaque icon="🏡" />
              </div>
            </Secao>
          ) : null}

          {tipoNormalizado === "comercial" ? (
            <Secao title="Detalhes do imóvel comercial" subtitle="Estrutura e recursos do imóvel.">
              <div style={{ display: "grid", gridTemplateColumns: camposGridColumns, gap: 16 }}>
                <Campo label="Tipo comercial" value={imovel.comercio_tipo} icon="🏬" />
                <Campo label="Pé-direito" value={imovel.pe_direito ? `${imovel.pe_direito} m` : null} icon="📏" />
                <Campo label="Tipo de piso" value={imovel.tipo_piso} icon="🧱" />
                <Campo label="Vitrine" value={imovel.vitrine ? "Sim" : null} icon="🪟" />
                <Campo label="Banheiro PNE" value={imovel.banheiro_pne ? "Sim" : null} icon="♿" />
                <Campo label="Rampas de acesso" value={imovel.rampas_acesso ? "Sim" : null} icon="↗️" />
                <Campo label="Tipo de energia" value={imovel.tipo_energia} icon="⚡" />
              </div>
            </Secao>
          ) : null}

          {diferenciais.length > 0 ? (
            <Secao title="Diferenciais" subtitle="Recursos extras deste imóvel.">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {diferenciais.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.22)",
                      fontWeight: 700,
                      color: "#bbf7d0",
                      fontSize: 14,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Secao>
          ) : null}

          <Secao title="Mapa e localização" subtitle="Visualize a região do imóvel no mapa.">
            <div
              style={{
                overflow: "hidden",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
              }}
            >
              <iframe
                src={getMapaSrc(imovel)}
                style={{
                  width: "100%",
                  height: isMobile ? 280 : 360,
                  border: "none",
                  display: "block",
                }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa do imóvel"
              />
            </div>

            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#38bdf8",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: 15,
                flexWrap: "wrap",
              }}
            >
              📍 Abrir no Google Maps
            </a>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: camposGridColumns,
                gap: 16,
                marginTop: 20,
              }}
            >
              {!isFazenda ? (
                <Campo label="Endereço" value={enderecoCompleto(imovel)} icon="🛣️" />
              ) : (
                <Campo label="Link do Maps" value={imovel.link_maps} icon="📍" />
              )}
              <Campo label="Bairro" value={imovel.bairro} icon="📍" />
              <Campo label="Cidade" value={imovel.cidade} icon="🏙️" />
              <Campo label="Município" value={imovel.municipio} icon="🌾" />
              <Campo label="Estado" value={imovel.estado} icon="🗺️" />
              <Campo label="CEP" value={imovel.cep} icon="📮" />
              <Campo label="Referência" value={imovel.referencia_local} icon="📌" />
            </div>
          </Secao>
        </div>
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          textDecoration: "none",
        }}
      >
        <button
          type="button"
          style={{
            background: "linear-gradient(135deg, #ffffff, #16a34a)",
            border: "none",
            borderRadius: "50%",
            width: isMobile ? 58 : 64,
            height: isMobile ? 58 : 64,
            color: "#fff",
            fontSize: isMobile ? 22 : 26,
            cursor: "pointer",
            boxShadow: "0 16px 40px rgba(0,0,0,0.42)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          💬
        </button>
      </a>

      {openPreview && selected && selected.tipo === "foto" ? (
        <div
          onClick={() => setOpenPreview(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? 12 : 20,
            cursor: "pointer",
            backdropFilter: "blur(6px)",
          }}
        >
          <button
            type="button"
            onClick={() => setOpenPreview(false)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              border: "none",
              borderRadius: 14,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.14)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            Fechar
          </button>

          <img
            src={`${API_BASE_URL}${selected.arquivo_url}`}
            alt={selected.nome_arquivo}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "95vw",
              maxHeight: "90vh",
              borderRadius: 18,
              objectFit: "contain",
              boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      ) : null}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

          * {
            box-sizing: border-box;
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            margin: 0;
            background: #020617;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            button, a {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `}
      </style>
    </div>
  );
}