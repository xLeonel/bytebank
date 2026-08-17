"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTransactions } from "@/contexts/Transactions";
import { brl } from "@/lib/format";
import { groupByMonth } from "../helpers";
import { EmptyChartState } from "../EmptyState";

const ENTRADAS_COLOR = "var(--bb-primary, #374C34)";
const SAIDAS_COLOR = "var(--bb-warning, #f59e0b)";

export function EntradasSaidasChart() {
  const { transactions } = useTransactions();
  const data = useMemo(() => groupByMonth(transactions), [transactions]);

  if (data.length === 0) {
    return <EmptyChartState />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(value) => brl.format(Number(value))} width={90} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => brl.format(Number(value))} />
        <Legend />
        <Bar dataKey="entradas" name="Entradas" fill={ENTRADAS_COLOR} radius={[4, 4, 0, 0]} />
        <Bar dataKey="saidas" name="Saídas" fill={SAIDAS_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
