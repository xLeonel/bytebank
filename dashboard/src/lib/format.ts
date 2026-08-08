/**
 * Returns the current day formatted as "Quinta-feira, 08/09/2024"
 * using the system clock — no mock dependency needed.
 */
export function getTodayFormatted(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString("pt-BR", { weekday: "long" });
  const date = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1) + ", " + date;
}

export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function maskAmount(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
