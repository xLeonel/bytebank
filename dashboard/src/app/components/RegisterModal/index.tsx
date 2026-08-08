"use client";

import { UserPlus } from "lucide-react";
import type { Props } from "./types";
import { Modal, ModalHeader } from "@/app/(logged)/_components/Modal";
import { RegisterForm } from "../RegisterForm";

/**
 * Modal de cadastro — usado no fluxo do /login.
 * A tela de cadastro dedicada fica em /cadastro (página, não modal).
 */
export function RegisterModal({ open, onClose, onSuccess }: Props) {
  return (
    <Modal open={open} onClose={onClose} ariaLabel="Cadastro de usuário">
      <ModalHeader
        icon={<UserPlus size={64} />}
        title="Preencha os campos abaixo para criar sua conta!"
      />
      <RegisterForm onSuccess={onSuccess} />
    </Modal>
  );
}
