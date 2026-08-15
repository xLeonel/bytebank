import type { ComponentType } from "react";
import { EntradasSaidasChart } from "../EntradasSaidasChart";
import { MovimentacaoPorTipoChart } from "../MovimentacaoPorTipoChart";
import { SaldoEvolucaoChart } from "../SaldoEvolucaoChart";

export const CHART_TABS: { id: string; label: string; Component: ComponentType }[] = [
  { id: "entradas-saidas", label: "Entradas vs Saídas por mês", Component: EntradasSaidasChart },
  { id: "movimentacao-tipo", label: "Movimentação por tipo", Component: MovimentacaoPorTipoChart },
  { id: "saldo", label: "Evolução do saldo", Component: SaldoEvolucaoChart },
];
