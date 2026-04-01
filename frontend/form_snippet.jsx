{/* URBANO */}
{form.tipo !== "fazenda" && (
  <>
    <Input label="CEP" name="cep" value={form.cep} onChange={handleChange} />
    <Input label="Estado" name="estado" value={form.estado} onChange={handleChange} />
    <Input label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} />
    <Input label="Bairro" name="bairro" value={form.bairro} onChange={handleChange} />
    <Input label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} />
    <Input label="Número" name="numero" value={form.numero} onChange={handleChange} />
    <Input label="Complemento" name="complemento" value={form.complemento} onChange={handleChange} />
    <Input label="Referência" name="referencia_local" value={form.referencia_local} onChange={handleChange} />
  </>
)}

{/* FAZENDA */}
{form.tipo === "fazenda" && (
  <>
    <Input label="Nome da fazenda" name="nome_fazenda" value={form.nome_fazenda} onChange={handleChange} />
    <Input label="Município" name="municipio" value={form.municipio} onChange={handleChange} />
    <Input label="Estado" name="estado" value={form.estado} onChange={handleChange} />
    <Input label="Referência local" name="referencia_local" value={form.referencia_local} onChange={handleChange} />
    <Input label="Link do Maps" name="link_maps" value={form.link_maps} onChange={handleChange} />
    <Input label="Latitude" name="latitude" value={form.latitude} onChange={handleChange} />
    <Input label="Longitude" name="longitude" value={form.longitude} onChange={handleChange} />
  </>
)}
