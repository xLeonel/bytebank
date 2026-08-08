export function EmptyChartState({
  title = "Nenhuma transação por aqui ainda",
  description = "Cadastre sua primeira transação para acompanhar suas finanças.",
}: {
  title?: string;
  description?: string;
} = {}) {
  return (
    <div className="h-[260px] flex flex-col items-center justify-center gap-2 px-4 text-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-10 w-10 opacity-50"
        style={{ color: "var(--bb-primary, #374C34)" }}
      >
        <path d="M3 3v18h18" />
        <path d="m7 14 3-3 3 3 5-5" />
      </svg>
      <span className="font-bold text-[var(--bb-dark,#332E2B)]">{title}</span>
      <span className="max-w-xs text-sm text-gray-500">{description}</span>
    </div>
  );
}
