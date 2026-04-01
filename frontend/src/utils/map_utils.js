export function getMapaSrc(imovel) {
  if (imovel?.link_maps) return imovel.link_maps;

  if (imovel?.latitude && imovel?.longitude) {
    return `https://www.google.com/maps?q=${imovel.latitude},${imovel.longitude}&z=15&output=embed`;
  }

  const endereco = [
    imovel?.endereco,
    imovel?.numero,
    imovel?.bairro,
    imovel?.cidade,
    imovel?.estado,
    imovel?.cep,
  ].filter(Boolean).join(", ");

  return `https://www.google.com/maps?q=${encodeURIComponent(endereco)}&output=embed`;
}
