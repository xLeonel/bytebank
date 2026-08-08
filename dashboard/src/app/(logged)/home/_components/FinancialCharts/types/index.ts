export type MonthlyTotals = {
  monthKey: string; // "YYYY-MM", used for chronological sorting
  label: string; // e.g. "Nov de 2022", used for display
  entradas: number;
  saidas: number;
};

export type TypeSlice = {
  type: string;
  total: number; // sum of absolute values of saída amounts for this type
};

export type BalancePoint = {
  date: string; // "DD/MM/YYYY", original transaction date
  balance: number; // accumulated balance after this transaction
};
