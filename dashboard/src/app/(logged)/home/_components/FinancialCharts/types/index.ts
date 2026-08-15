export type MonthlyTotals = {
  monthKey: string; // "YYYY-MM", used for chronological sorting
  label: string; // e.g. "Nov de 2022", used for display
  entradas: number;
  saidas: number;
};

export type TypeSlice = {
  type: string; // rótulo exibido do tipo: "Depósito", "Saque", "Transferência Pix"
  total: number; // soma dos valores absolutos movimentados neste tipo
  direcao: "entrada" | "saida"; // Depósito é crédito; os demais, débito
};

export type BalancePoint = {
  date: string; // "DD/MM/YYYY", original transaction date
  balance: number; // accumulated balance after this transaction
};
