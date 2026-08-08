"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTransactions } from "@/contexts/Transactions";
import { brl } from "@/lib/format";
import { computeBalanceOverTime } from "../helpers";
import { EmptyChartState } from "../EmptyState";
import type { BalancePoint } from "../types";

const LINE_COLOR = "var(--bb-primary, #374C34)";

/**
 * Collapses consecutive points that share the same `date`, keeping only the
 * last one (i.e. the end-of-day balance). This is purely a chart-rendering
 * concern (avoids duplicate X-axis labels) — it does not change
 * `computeBalanceOverTime`'s one-point-per-transaction contract.
 */
function collapseConsecutiveSameDate(points: BalancePoint[]): BalancePoint[] {
  const result: BalancePoint[] = [];
  for (const point of points) {
    const last = result[result.length - 1];
    if (last && last.date === point.date) {
      result[result.length - 1] = point;
    } else {
      result.push(point);
    }
  }
  return result;
}

export function SaldoEvolucaoChart() {
  const { transactions, balance } = useTransactions();
  const data = useMemo(
    () => collapseConsecutiveSameDate(computeBalanceOverTime(transactions, balance)),
    [transactions, balance]
  );

  if (data.length === 0) {
    return <EmptyChartState />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(value) => brl.format(Number(value))} width={90} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => brl.format(Number(value))} />
        <Line type="monotone" dataKey="balance" name="Saldo" stroke={LINE_COLOR} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
