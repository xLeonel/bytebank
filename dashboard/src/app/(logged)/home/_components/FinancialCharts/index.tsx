"use client";

import { useState } from "react";
import { CHART_TABS } from "./constants";

export function FinancialCharts() {
  const [activeTab, setActiveTab] = useState(CHART_TABS[0].id);
  const active = CHART_TABS.find((tab) => tab.id === activeTab) ?? CHART_TABS[0];
  const ActiveChart = active.Component;

  return (
    <section className="bg-white rounded-md p-8 flex-1">
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

      <ActiveChart />
    </section>
  );
}
