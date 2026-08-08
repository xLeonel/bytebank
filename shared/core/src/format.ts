/** Formatação de moeda (Real). */
export const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Ex.: "Quinta-feira, 08/08/2026" usando o relógio do sistema. */
export function getTodayFormatted(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  const date = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1) + ', ' + date;
}

/** ISO (YYYY-MM-DD...) -> DD/MM/YYYY, sem deslocar o dia pelo fuso (usa UTC). */
export function toDisplayDate(iso: string): string {
  const date = new Date(iso);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

/** DD/MM/YYYY -> YYYY-MM-DD (backend valida IsDateString). */
export function toIsoDate(display: string): string {
  const [d, m, y] = display.split('/');
  return y && m && d ? `${y}-${m}-${d}` : display;
}

/** Máscara de valor: dígitos -> "1.234,56". */
export function maskAmount(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
