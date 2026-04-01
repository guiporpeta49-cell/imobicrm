from pathlib import Path
from tempfile import NamedTemporaryFile
from datetime import datetime
import textwrap

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.imovel import Imovel
from app.models.empresa import Empresa
from app.models.corretor import Corretor

router = APIRouter(prefix="/imoveis", tags=["Imóvel PDF"])


def draw_line(c: canvas.Canvas, x1, y, x2, width=0.7):
    c.setLineWidth(width)
    c.line(x1, y, x2, y)


def write(c: canvas.Canvas, x, y, text, size=10, bold=False):
    font = "Helvetica-Bold" if bold else "Helvetica"
    c.setFont(font, size)
    c.drawString(x, y, str(text or ""))


def write_center(c: canvas.Canvas, x, y, text, size=11, bold=False):
    font = "Helvetica-Bold" if bold else "Helvetica"
    c.setFont(font, size)
    c.drawCentredString(x, y, str(text or ""))


def fit_text(value, max_len=75):
    text = str(value or "")
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."


def format_money(value):
    try:
        return f"R$ {float(value):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except Exception:
        return "R$ 0,00"


def value_or_dash(value):
    return value if value not in (None, "", []) else "-"


def draw_wrapped_text(c: canvas.Canvas, text, x, y, max_chars=95, line_height=14, size=10):
    c.setFont("Helvetica", size)
    linhas = textwrap.wrap(str(text or ""), width=max_chars) or [""]
    for linha in linhas:
        c.drawString(x, y, linha)
        y -= line_height
    return y


def draw_info_block(c: canvas.Canvas, title, rows, x, y, line_width=520):
    write(c, x, y, title, 13, True)
    y -= 20
    for row in rows:
        draw_line(c, x, y - 3, x + line_width)
        write(c, x + 5, y + 2, row, 10, False)
        y -= 22
    return y


def build_pdf_for_imovel(imovel: Imovel, empresa: Empresa, corretor: Corretor | None) -> str:
    tmp = NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = Path(tmp.name)
    tmp.close()

    c = canvas.Canvas(str(pdf_path), pagesize=A4)
    width, height = A4

    logo_ok = False
    logo_path = None
    if empresa.logo_url:
        logo_path = Path("." + empresa.logo_url) if str(empresa.logo_url).startswith("/") else Path(empresa.logo_url)
        if logo_path.exists():
            try:
                c.drawImage(ImageReader(str(logo_path)), 150, 735, width=280, height=80, preserveAspectRatio=True, mask="auto")
                logo_ok = True
            except Exception:
                logo_ok = False

    if not logo_ok:
        write_center(c, width / 2, 785, empresa.nome or "Minha Imobiliária", size=22, bold=True)

    write_center(c, width / 2, 705, "APRESENTAÇÃO DO IMÓVEL", size=16, bold=True)
    write_center(c, width / 2, 685, fit_text(imovel.titulo, 60), size=12, bold=False)

    if logo_ok and logo_path:
        try:
            c.saveState()
            c.setFillAlpha(0.06)
            c.drawImage(ImageReader(str(logo_path)), 90, 250, width=420, height=420, preserveAspectRatio=True, mask="auto")
            c.restoreState()
        except Exception:
            pass

    y = 635
    infos_gerais = [
        f"Título: {fit_text(imovel.titulo, 70)}",
        f"Tipo: {value_or_dash(imovel.tipo)}",
        f"Finalidade: {value_or_dash(imovel.finalidade)}",
        f"Valor: {format_money(imovel.valor)}",
        f"Status: {value_or_dash(getattr(imovel, 'status', None))}",
        f"Corretor responsável: {corretor.nome if corretor else '-'}",
    ]
    y = draw_info_block(c, "INFORMAÇÕES GERAIS", infos_gerais, 40, y)
    y -= 10

    localizacao = [
        f"Endereço: {fit_text(imovel.endereco, 70)}",
        f"Bairro: {value_or_dash(imovel.bairro)}",
        f"Cidade: {value_or_dash(imovel.cidade)}",
        f"Proprietário: {value_or_dash(getattr(imovel, 'nome_proprietario', None))}",
        f"Telefone do proprietário: {value_or_dash(getattr(imovel, 'telefone_proprietario', None))}",
    ]
    y = draw_info_block(c, "LOCALIZAÇÃO", localizacao, 40, y)
    y -= 10

    caracteristicas = [
        f"Quartos: {value_or_dash(imovel.quartos)}",
        f"Banheiros: {value_or_dash(imovel.banheiros)}",
        f"Vagas: {value_or_dash(imovel.vagas)}",
    ]
    if str(imovel.tipo or "").lower() == "fazenda":
        caracteristicas.extend([
            f"Área em hectares: {value_or_dash(getattr(imovel, 'area_hectares', None))}",
            f"Área em alqueires: {value_or_dash(getattr(imovel, 'area_alqueires', None))}",
            f"Distância do asfalto: {value_or_dash(getattr(imovel, 'distancia_asfalto_km', None))} km",
            f"Distância da cidade: {value_or_dash(getattr(imovel, 'distancia_cidade_km', None))} km",
            f"Área agricultável: {value_or_dash(getattr(imovel, 'area_agricultavel', None))}",
            f"Área inaproveitável: {value_or_dash(getattr(imovel, 'area_inaproveitavel', None))}",
            f"Plantio existente: {fit_text(getattr(imovel, 'plantio_existente', None), 70)}",
        ])
    y = draw_info_block(c, "CARACTERÍSTICAS", caracteristicas, 40, y)

    y -= 10
    write(c, 40, y, "DESCRIÇÃO", 13, True)
    y -= 20
    descricao = str(imovel.descricao or "Sem descrição cadastrada.")
    draw_wrapped_text(c, descricao, 40, y, max_chars=95, line_height=14, size=10)

    c.showPage()
    if logo_ok and logo_path:
        try:
            c.saveState()
            c.setFillAlpha(0.05)
            c.drawImage(ImageReader(str(logo_path)), 90, 220, width=420, height=420, preserveAspectRatio=True, mask="auto")
            c.restoreState()
        except Exception:
            pass

    y = 780
    write_center(c, width / 2, y, "RESUMO COMERCIAL DO IMÓVEL", 16, True)
    y -= 40
    resumo = [
        f"Imóvel: {fit_text(imovel.titulo, 70)}",
        f"Valor anunciado: {format_money(imovel.valor)}",
        f"Cidade: {value_or_dash(imovel.cidade)}",
        f"Bairro: {value_or_dash(imovel.bairro)}",
        f"Tipo: {value_or_dash(imovel.tipo)}",
        f"Finalidade: {value_or_dash(imovel.finalidade)}",
        f"Corretor responsável: {corretor.nome if corretor else '-'}",
        f"CRECI: {corretor.creci if corretor else '-'}",
        f"Data de emissão: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
    ]
    for linha in resumo:
        draw_line(c, 60, y - 2, 535)
        write(c, 65, y + 2, linha, 11)
        y -= 28

    y -= 35
    write(c, 60, y, "Observações:", 12, True)
    y -= 20
    obs = c.beginText(60, y)
    obs.setFont("Helvetica", 10)
    obs.textLine("Este material foi gerado automaticamente pelo sistema imobiliário.")
    obs.textLine("Os valores e informações podem sofrer alterações sem aviso prévio.")
    obs.textLine("Consulte o corretor responsável para confirmar disponibilidade.")
    c.drawText(obs)

    y -= 90
    draw_line(c, 60, y, 250)
    draw_line(c, 340, y, 535)
    write(c, 105, y - 18, empresa.nome or "Imobiliária", 10, True)
    write(c, 390, y - 18, corretor.nome if corretor else "Corretor", 10, True)

    c.save()
    return str(pdf_path)


@router.get("/publico/imovel/{token}/pdf")
def gerar_pdf_publico(token: str, db: Session = Depends(get_db)):
    imovel = db.query(Imovel).filter(Imovel.public_token == token, Imovel.publicado == True).first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")
    empresa = db.query(Empresa).filter(Empresa.id == imovel.empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    corretor = db.query(Corretor).filter(Corretor.id == imovel.corretor_id).first() if imovel.corretor_id else None
    pdf_path = build_pdf_for_imovel(imovel, empresa, corretor)
    return FileResponse(path=pdf_path, filename=f"imovel_publico_{imovel.id}.pdf", media_type="application/pdf")


@router.get("/{imovel_id}/pdf")
def gerar_pdf_imovel(
    imovel_id: int,
    db: Session = Depends(get_db),
    user: Corretor = Depends(get_current_user),
):
    imovel = db.query(Imovel).filter(Imovel.id == imovel_id, Imovel.empresa_id == user.empresa_id).first()
    if not imovel:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")
    empresa = db.query(Empresa).filter(Empresa.id == user.empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    corretor = db.query(Corretor).filter(Corretor.id == user.id).first()
    pdf_path = build_pdf_for_imovel(imovel, empresa, corretor)
    return FileResponse(path=pdf_path, filename=f"imovel_{imovel.id}.pdf", media_type="application/pdf")
