export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = "max-w-3xl",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 p-4 backdrop-blur-sm">
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-[2rem] border border-cyan-900/40 bg-[#071526]/95 shadow-[0_25px_80px_rgba(0,0,0,0.45)]`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">
              Preencha os dados para salvar o cadastro.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Fechar
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
