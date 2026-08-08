"use client";

import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { LegendPayload } from "recharts";
import { useTransactions } from "@/contexts/Transactions";
import { brl } from "@/lib/format";
import { groupExpensesByType } from "../helpers";
import { EmptyChartState } from "../EmptyState";
import type { TypeSlice } from "../types";

const SLICE_COLORS = [
  "var(--bb-primary, #374C34)",
  "var(--bb-warning, #f59e0b)",
  "#7A9471",
  "#B45309",
  "#94A3B8",
];

export function GastosPorTipoChart() {
  const { transactions } = useTransactions();
  const data = useMemo(() => groupExpensesByType(transactions), [transactions]);
  const total = useMemo(() => data.reduce((acc, slice) => acc + slice.total, 0), [data]);

  if (data.length === 0) {
    return (
      <EmptyChartState
        title="Nenhuma saída registrada"
        description="Cadastre uma transação de saída para ver a distribuição por tipo."
      />
    );
  }

  const legendFormatter = (value: string, entry: LegendPayload) => {
    const slice = entry.payload as TypeSlice | undefined;
    const sliceTotal = slice?.total ?? 0;
    const percent = total > 0 ? (sliceTotal / total) * 100 : 0;
    return `${value}: ${brl.format(sliceTotal)} (${percent.toFixed(1)}%)`;
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="type"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((slice, index) => (
            <Cell key={slice.type} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => brl.format(Number(value))} />
        <Legend formatter={legendFormatter} />
      </PieChart>
    </ResponsiveContainer>
  );
}
