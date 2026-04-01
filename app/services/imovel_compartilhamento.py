from urllib.parse import quote


def fmt_money(value) -> str:
    try:
        return f"R$ {float(value):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except Exception:
        return "R$ 0,00"


def valor_ou_traco(value):
    return value if value not in (None, "", []) else "-"


def normalizar_base_url(base_url: str) -> str:
    return str(base_url or "").rstrip("/")


def montar_texto_imovel_whatsapp(imovel, midias, base_url: str) -> str:
    base_url = normalizar_base_url(base_url)
    link_publico = f"{base_url}/publico/imovel/{imovel.public_token}" if base_url and getattr(imovel, 'public_token', None) else ""

    links_midia = []
    for midia in (midias or [])[:5]:
        if getattr(midia, 'arquivo_url', None):
            links_midia.append(f"{base_url}{midia.arquivo_url}")

    linhas = [
        "🏡 *Oportunidade de imóvel*",
        "",
        f"*Título:* {valor_ou_traco(imovel.titulo)}",
        f"*Valor:* {fmt_money(imovel.valor)}",
        f"*Tipo:* {valor_ou_traco(imovel.tipo)}",
        f"*Finalidade:* {valor_ou_traco(imovel.finalidade)}",
        "",
        "📍 *Localização*",
        f"*Endereço:* {valor_ou_traco(imovel.endereco)}",
        f"*Bairro:* {valor_ou_traco(imovel.bairro)}",
        f"*Cidade:* {valor_ou_traco(imovel.cidade)}",
        "",
        "ℹ️ *Detalhes*",
        f"*Quartos:* {valor_ou_traco(imovel.quartos)}",
        f"*Banheiros:* {valor_ou_traco(imovel.banheiros)}",
        f"*Vagas:* {valor_ou_traco(imovel.vagas)}",
    ]

    if str(getattr(imovel, 'tipo', '')).lower() == 'fazenda':
        linhas.extend([
            "",
            "🌱 *Informações rurais*",
            f"*Área em hectares:* {valor_ou_traco(getattr(imovel, 'area_hectares', None))}",
            f"*Área em alqueires:* {valor_ou_traco(getattr(imovel, 'area_alqueires', None))}",
            f"*Distância do asfalto:* {valor_ou_traco(getattr(imovel, 'distancia_asfalto_km', None))} km",
            f"*Distância da cidade:* {valor_ou_traco(getattr(imovel, 'distancia_cidade_km', None))} km",
            f"*Área agricultável:* {valor_ou_traco(getattr(imovel, 'area_agricultavel', None))}",
            f"*Área inaproveitável:* {valor_ou_traco(getattr(imovel, 'area_inaproveitavel', None))}",
            f"*Plantio existente:* {valor_ou_traco(getattr(imovel, 'plantio_existente', None))}",
        ])

    if getattr(imovel, 'descricao', None):
        linhas.extend(["", "📝 *Descrição*", str(imovel.descricao).strip()])

    if link_publico:
        linhas.extend(["", "🔗 *Ver imóvel*", link_publico])

    if links_midia:
        linhas.extend(["", "🖼️ *Mídias*", *links_midia])

    linhas.extend(["", "📞 Entre em contato para mais informações."])
    
    return "\n".join(linhas).strip()


def montar_link_whatsapp(texto: str, telefone: str | None = None) -> str:
    texto_codificado = quote(texto)
    telefone_limpo = "".join(filter(str.isdigit, str(telefone or "")))
    if telefone_limpo:
        return f"https://wa.me/{telefone_limpo}?text={texto_codificado}"
    return f"https://wa.me/?text={texto_codificado}"
