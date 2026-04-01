export function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        {badge ? (
          <div className="mb-3 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            {badge}
          </div>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-300">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`card-premium p-6 ${className}`}>{children}</div>;
}

export function MetricCard({ title, value, hint, tone = "emerald" }) {
  const tones = {
    emerald: "metric-emerald",
    cyan: "metric-cyan",
    amber: "metric-amber",
    violet: "metric-violet",
  };

  return (
    <div className={`card-metric-premium ${tones[tone] || tones.emerald}`}>
      <div className="text-sm text-slate-300">{title}</div>
      <div className="mt-3 text-2xl font-bold text-white sm:text-3xl">{value}</div>
      {hint ? <div className="mt-2 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25",
    secondary: "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10",
    danger: "bg-red-500/12 text-red-200 border border-red-400/25 hover:bg-red-500/20",
    success: "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/25",
    ghost: "bg-transparent text-slate-200 border border-white/10 hover:bg-white/5",
  };
  return (
    <button
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Label({ children }) {
  return <label className="mb-2 block text-sm font-medium text-slate-200">{children}</label>;
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-400/40 ${props.className || ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-[#0a1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40 ${props.className || ""}`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-400/40 ${props.className || ""}`}
    />
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function StatusBadge({ value }) {
  const map = {
    disponivel: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    reservado: "bg-amber-500/15 text-amber-200 border border-amber-400/30",
    vendido: "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30",
    alugado: "bg-indigo-500/15 text-indigo-200 border border-indigo-400/30",
    pendente: "bg-amber-500/15 text-amber-200 border border-amber-400/30",
    aceita: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    recusada: "bg-red-500/15 text-red-200 border border-red-400/30",
    agendada: "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30",
    realizada: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    cancelada: "bg-red-500/15 text-red-200 border border-red-400/30",
    em_negociacao: "bg-amber-500/15 text-amber-200 border border-amber-400/30",
    fechada: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    ativa: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
    inativa: "bg-white/8 text-slate-200 border border-white/10",
  };
  const cls = map[value] || "bg-white/8 text-slate-200 border border-white/10";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{String(value).replaceAll("_", " ")}</span>;
}

export function Alert({ type = "error", children, className = "" }) {
  const cls = type === "success"
    ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
    : type === "warning"
    ? "border-amber-400/25 bg-amber-500/10 text-amber-200"
    : "border-red-400/25 bg-red-500/10 text-red-200";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${cls} ${className}`}>{children}</div>;
}

export function DataTable({ columns, children }) {
  return (
    <div className="table-premium">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>{columns.map((col) => <th key={col} className="px-4 py-4 text-left font-semibold">{col}</th>)}</tr>
          </thead>
          <tbody className="text-slate-200">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
