"use client";

import { ChevronRight } from "lucide-react";
import { brl } from "@/lib/format";
import type { Props } from "./types";

export function TransactionList({
  items,
  onSelect,
  showDividers = false,
  showDescription = false,
}: Props) {
  return (
    <ul className="flex flex-col gap-5">
      {items.map((tx) => (
        <li key={tx.id} className="text-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{tx.type}</p>
              <p className="font-semibold">{brl.format(tx.amount)}</p>
              {showDescription && tx.description && (
                <p className="text-xs text-gray-500 mt-0.5">{tx.description}</p>
              )}
            </div>
            <span className="text-xs text-gray-500">{tx.date}</span>
          </div>
          <div
            className={`flex items-center justify-between mt-1 ${
              showDividers ? "border-b border-gray-200 pb-2" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(tx)}
              className="text-blue-600 underline text-xs cursor-pointer"
            >
              Editar transação
            </button>
            <button
              type="button"
              onClick={() => onSelect(tx)}
              aria-label={`Editar transação ${tx.type} ${tx.date}`}
              className="text-blue-600 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
