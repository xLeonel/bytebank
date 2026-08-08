"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { brl } from "@/lib/format";
import { useTransactions } from "@/contexts/Transactions";
import { BTN_DANGER_CLS, BTN_PRIMARY_CLS, Field, INPUT_CLS, INPUT_DISABLED_CLS } from "../Field";
import { Modal, ModalHeader } from "../Modal";
import type { Props } from "./types";
import type { Transaction } from "./types";

export type { Transaction } from "./types";

function toISODate(date: string) {
  const [day, month, year] = date.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function toDisplayDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function getTodayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFutureDate(value: string, today: string) {
  const valueDate = new Date(`${value}T00:00:00`);
  const todayDate = new Date(`${today}T00:00:00`);
  return valueDate.getTime() > todayDate.getTime();
}

export function TransactionDetailModal({ transaction, onClose }: Props) {
  if (!transaction) return null;
  return <Editor transaction={transaction} onClose={onClose} />;
}

type EditorProps = {
  transaction: Transaction;
  onClose: () => void;
};

function Editor({ transaction, onClose }: EditorProps) {
  const { updateTransaction, deleteTransaction } = useTransactions();
  const [type, setType] = useState(transaction.type);
  const [description, setDescription] = useState(transaction.description ?? "");
  const [date, setDate] = useState(() => toISODate(transaction.date));
  const [dateError, setDateError] = useState("");
  const todayISODate = getTodayISODate();

  const validateDate = (value: string) => {
    if (!value) {
      setDateError("Não é possível selecionar datas futuras");
      return false;
    }

    if (isFutureDate(value, todayISODate)) {
      setDateError("Não é possível selecionar datas futuras");
      return false;
    }

    setDateError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDate(date)) {
      return;
    }

    updateTransaction(transaction.id, { type, description, date: toDisplayDate(date) });
    onClose();
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    onClose();
  };

  return (
    <Modal open onClose={onClose} ariaLabel="Editar transação">
      <ModalHeader
        icon={<CreditCard size={64} />}
        title="Edite os campos abaixo para realizar sua operação!"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome da transação">
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Descrição (opcional)">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Digite a descrição da transação"
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Valor">
          <input
            type="text"
            defaultValue={brl.format(Math.abs(transaction.amount))}
            disabled
            className={INPUT_DISABLED_CLS}
          />
        </Field>

        <Field label="Data Operação">
          <input
            type="date"
            value={date}
            max={todayISODate}
            onChange={(e) => {
              const nextDate = e.target.value;
              setDate(nextDate);
              validateDate(nextDate);
            }}
            className={INPUT_CLS}
          />
          {dateError ? <p className="mt-1 text-sm text-red-600">{dateError}</p> : null}
        </Field>

        <button type="submit" className={`mt-4 ${BTN_PRIMARY_CLS}`}>
          Salvar alterações
        </button>
        <button type="button" onClick={handleDelete} className={BTN_DANGER_CLS}>
          Excluir transação
        </button>
      </form>
    </Modal>
  );
}
