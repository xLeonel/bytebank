import type { ComponentType } from "react";
import { EntradasSaidasChart } from "../EntradasSaidasChart";
import { GastosPorTipoChart } from "../GastosPorTipoChart";
import { SaldoEvolucaoChart } from "../SaldoEvolucaoChart";

export const CHART_TABS: { id: string; label: string; Component: ComponentType }[] = [
  { id: "entradas-saidas", label: "Entradas vs Saídas por mês", Component: EntradasSaidasChart },
  { id: "gastos-tipo", label: "Distribuição de gastos por tipo", Component: GastosPorTipoChart },
  { id: "saldo", label: "Evolução do saldo", Component: SaldoEvolucaoChart },
];
