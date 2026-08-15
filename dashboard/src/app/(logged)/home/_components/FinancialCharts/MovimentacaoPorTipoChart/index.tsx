"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTransactions } from "@/contexts/Transactions";
import { brl } from "@/lib/format";
import { groupTotalsByType } from "../helpers";
import { EmptyChartState } from "../EmptyState";

/**
 * Volume movimentado por tipo de transação — os 3 tipos do cadastro.
 *
 * Barra horizontal ordenada em vez de pizza: com Depósito (crédito) ao lado de
 * Saque e Transferência Pix (débito), uma pizza sugeriria parte-de-um-todo que
 * não existe — não faz sentido dizer que o depósito é "x% do total" quando ele
 * anda na direção oposta. A barra compara volumes sem afirmar isso.
 *
 * A cor carrega a direção (entrada vs saída), que é a informação que impede o
 * gráfico de ser lido errado. São 2 grupos, então vai legenda junto.
 */
const COR_ENTRADA = "var(--bb-primary, #374C34)";
const COR_SAIDA = "var(--bb-warning, #f59e0b)";

export function MovimentacaoPorTipoChart() {
  const { transactions } = useTransactions();
  const data = useMemo(() => groupTotalsByType(transactions), [transactions]);

  if (data.length === 0) {
    return (
      <EmptyChartState
        title="Nenhuma transação registrada"
        description="Cadastre uma transação para ver o volume movimentado por tipo."
      />
    );
  }

  const altura = Math.max(200, data.length * 46 + 40);

  return (
    <div>
      <ResponsiveContainer width="100%" height={altura}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="type"
            width={130}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#475569" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
            formatter={(value, _name, item) => {
              const direcao = (item?.payload as { direcao?: string } | undefined)?.direcao;
              const rotulo = direcao === "entrada" ? "Entrada" : "Saída";
              return [brl.format(Number(value ?? 0)), rotulo];
            }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={22} isAnimationActive={false}>
            {data.map((fatia) => (
              <Cell
                key={fatia.type}
                fill={fatia.direcao === "entrada" ? COR_ENTRADA : COR_SAIDA}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda manual: a cor codifica direção, não série, então a legenda do
          Recharts (que lê o dataKey) diria "total" e não ajudaria. */}
      <div className="flex items-center justify-center gap-5 mt-2 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="w-3 h-3 rounded-sm" style={{ background: COR_ENTRADA }} />
          Entrada
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="w-3 h-3 rounded-sm" style={{ background: COR_SAIDA }} />
          Saída
        </span>
      </div>
    </div>
  );
}
