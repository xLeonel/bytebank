"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { ModalHeaderProps, ModalProps } from "./types";

export function Modal({ open, onClose, ariaLabel, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-md w-full max-w-md p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <X size={20} />
        </button>

        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ icon, title }: ModalHeaderProps) {
  return (
    <>
      <div
        aria-hidden
        className="h-32 flex items-center justify-center text-gray-400"
      >
        {icon}
      </div>
      <h2 className="text-center text-base font-semibold mt-2 mb-6">{title}</h2>
    </>
  );
}
