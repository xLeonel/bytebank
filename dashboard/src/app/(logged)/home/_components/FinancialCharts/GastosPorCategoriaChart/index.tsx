"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTransactions } from "@/contexts/Transactions";
import { brl } from "@/lib/format";
import { groupExpensesByCategory } from "../helpers";
import { EmptyChartState } from "../EmptyState";

/**
 * Barra horizontal, uma cor só, ordenada da maior para a menor.
 *
 * Barra em vez de pizza porque são ~11 categorias: acima de ~7 fatias a pizza
 * fica ilegível e exigiria uma paleta categórica grande, onde tons vizinhos
 * ficam indistinguíveis para quem tem daltonismo. Como as barras já estão
 * ordenadas por tamanho, a cor não precisa carregar identidade — uma só basta,
 * e o nome da categoria fica escrito ao lado de cada barra.
 */
const BAR_COLOR = "var(--bb-primary, #374C34)";
const BAR_COLOR_MAIOR = "var(--bb-warning, #f59e0b)";

export function GastosPorCategoriaChart() {
  const { transactions } = useTransactions();
  const data = useMemo(() => groupExpensesByCategory(transactions), [transactions]);
  const total = useMemo(() => data.reduce((acc, fatia) => acc + fatia.total, 0), [data]);

  if (data.length === 0) {
    return (
      <EmptyChartState
        title="Nenhuma saída registrada"
        description="Cadastre uma transação de saída para ver a distribuição por categoria."
      />
    );
  }

  // Altura acompanha a quantidade de categorias para as barras não se espremerem.
  const altura = Math.max(220, data.length * 34 + 40);

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 72, bottom: 4, left: 8 }}>
        <CartesianGrid horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="category"
          width={110}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#475569" }}
        />
        <Tooltip
          cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
          formatter={(value) => {
            const valor = Number(value ?? 0);
            const pct = total > 0 ? (valor / total) * 100 : 0;
            return `${brl.format(valor)} (${pct.toFixed(1)}%)`;
          }}
        />
        <Bar dataKey="total" name="Gasto" radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
          {data.map((fatia, i) => (
            // Só a maior categoria recebe o âmbar — é a informação que o card
            // existe para dar. As demais ficam no verde de marca.
            <Cell key={fatia.category} fill={i === 0 ? BAR_COLOR_MAIOR : BAR_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
