"use client";

import { useState } from "react";
import { CHART_TABS } from "./constants";

export function FinancialCharts() {
  const [activeTab, setActiveTab] = useState(CHART_TABS[0].id);
  const active = CHART_TABS.find((tab) => tab.id === activeTab) ?? CHART_TABS[0];
  const ActiveChart = active.Component;

  // O card é `flex-1` na coluna da home, então sobra altura. Para o gráfico
  // ocupá-la, o card vira uma coluna flex e a área do gráfico recebe
  // `flex-1 min-h-0` — sem o min-h-0 um filho flex nunca encolhe abaixo do
  // conteúdo, e o height="100%" do ResponsiveContainer fica sem referência.
  return (
    <section className="bg-white rounded-md p-8 flex-1 flex flex-col min-h-0">
      <h2 className="text-lg font-bold mb-6">Análise financeira</h2>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {CHART_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
              tab.id === activeTab
                ? "border-[var(--bb-primary,#374C34)] text-[var(--bb-primary,#374C34)]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <ActiveChart />
      </div>
    </section>
  );
}
