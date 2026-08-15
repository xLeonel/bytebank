import type { ComponentType } from "react";
import { EntradasSaidasChart } from "../EntradasSaidasChart";
import { GastosPorCategoriaChart } from "../GastosPorCategoriaChart";
import { SaldoEvolucaoChart } from "../SaldoEvolucaoChart";

export const CHART_TABS: { id: string; label: string; Component: ComponentType }[] = [
  { id: "entradas-saidas", label: "Entradas vs Saídas por mês", Component: EntradasSaidasChart },
  { id: "gastos-categoria", label: "Gastos por categoria", Component: GastosPorCategoriaChart },
  { id: "saldo", label: "Evolução do saldo", Component: SaldoEvolucaoChart },
];
