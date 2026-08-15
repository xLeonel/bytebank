import type { Transaction } from "@/app/(logged)/_components/TransactionDetailModal/types";
import type { MonthlyTotals, TypeSlice, BalancePoint } from "../types";

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
});

export function parseTransactionDate(date: string): Date {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day);
}

export function sortByDateAsc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => parseTransactionDate(a.date).getTime() - parseTransactionDate(b.date).getTime()
  );
}

export function groupByMonth(transactions: Transaction[]): MonthlyTotals[] {
  const totalsByMonth = new Map<string, MonthlyTotals>();

  for (const tx of sortByDateAsc(transactions)) {
    const parsedDate = parseTransactionDate(tx.date);
    const monthKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, "0")}`;

    if (!totalsByMonth.has(monthKey)) {
      const label = MONTH_LABEL_FORMATTER.format(parsedDate);
      totalsByMonth.set(monthKey, {
        monthKey,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        entradas: 0,
        saidas: 0,
      });
    }

    const totals = totalsByMonth.get(monthKey)!;
    if (tx.amount > 0) {
      totals.entradas += tx.amount;
    } else if (tx.amount < 0) {
      totals.saidas += Math.abs(tx.amount);
    }
  }

  return Array.from(totalsByMonth.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

/**
 * Soma o valor movimentado por tipo de transação, do maior para o menor.
 *
 * Cobre os 3 tipos do cadastro — Depósito, Saque e Transferência Pix — e não
 * só as saídas. Como Depósito é crédito e os outros dois são débito, soma-se o
 * valor absoluto (volume movimentado) e devolve-se a direção de cada um, para
 * o gráfico deixar a diferença explícita pela cor em vez de misturar entrada e
 * saída num único percentual sem significado.
 */
export function groupTotalsByType(transactions: Transaction[]): TypeSlice[] {
  const totaisPorTipo = new Map<string, { total: number; direcao: "entrada" | "saida" }>();

  for (const tx of transactions) {
    if (tx.amount === 0) continue;
    const direcao = tx.amount > 0 ? "entrada" : "saida";
    const atual = totaisPorTipo.get(tx.type);
    totaisPorTipo.set(tx.type, {
      total: (atual?.total ?? 0) + Math.abs(tx.amount),
      direcao: atual?.direcao ?? direcao,
    });
  }

  return Array.from(totaisPorTipo.entries())
    .map(([type, { total, direcao }]) => ({ type, total, direcao }))
    .sort((a, b) => b.total - a.total);
}

export function computeBalanceOverTime(
  transactions: Transaction[],
  currentBalance: number
): BalancePoint[] {
  const sumOfAmounts = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const baseline = currentBalance - sumOfAmounts;

  let runningBalance = baseline;
  return sortByDateAsc(transactions).map((tx) => {
    runningBalance += tx.amount;
    return { date: tx.date, balance: runningBalance };
  });
}
