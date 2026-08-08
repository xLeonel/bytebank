"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Modal, ModalHeader } from "@/app/(logged)/_components/Modal";
import { Props } from "./types";


export function SuccessModal({ open, message, onClose, redirectIn = 2 }: Props) {
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!open) return;    
    const timer = setTimeout(onClose, redirectIn * 1000);
    return () => clearTimeout(timer);
  }, [open, onClose, redirectIn]);

  if (!mounted) return null;

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Sucesso">
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <CheckCircle size={64} className="text-green-500" />
        <ModalHeader
          icon={<div />}
          title={message || "Operação realizada com sucesso!"}
        />
        <p className="text-gray-600 text-sm">
          Você será redirecionado em {redirectIn} segundos...
        </p>
      </div>
    </Modal>
  );
}