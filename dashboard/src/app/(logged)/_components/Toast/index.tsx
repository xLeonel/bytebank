"use client";

import { useEffect } from "react";
import { CircleCheck, TriangleAlert, X } from "lucide-react";

export type ToastVariant = "success" | "error";

/**
 * Toast fixo (canto inferior direito). Some sozinho após alguns segundos ou no X.
 * Usado para feedback de criar/editar/excluir (sucesso ou erro).
 */
export function Toast({
  message,
  variant = "success",
  onClose,
}: {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, variant, onClose]);

  const isSuccess = variant === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`fixed bottom-6 right-6 z-[1100] flex max-w-sm items-start gap-2 rounded-md border p-4 shadow-lg ${
        isSuccess ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      {isSuccess ? (
        <CircleCheck size={18} className="mt-0.5 shrink-0 text-[var(--bb-success,#47A138)]" />
      ) : (
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
      )}
      <p className={`flex-1 text-sm ${isSuccess ? "text-green-800" : "text-red-700"}`}>
        {message}
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className={isSuccess ? "text-green-700 hover:text-green-900" : "text-red-600 hover:text-red-800"}
      >
        <X size={16} />
      </button>
    </div>
  );
}
