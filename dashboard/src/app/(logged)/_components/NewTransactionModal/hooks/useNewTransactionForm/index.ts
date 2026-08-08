import { useEffect, useState } from "react";

export function useNewTransactionForm(open: boolean) {
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (open) {
      setType("");
      setAmount("");
      setDate("");
    }
  }, [open]);

  return { type, setType, amount, setAmount, date, setDate };
}
