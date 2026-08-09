"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getAccountData, type CurrentUserData } from "@/lib/systemAccount";
import { bus, TRANSACTION_EVENTS } from "@bytebank/mfe-events";

type AccountContextValue = {
  data: CurrentUserData | null;
  loading: boolean;
  error: boolean;
  /** Muda a cada carga bem-sucedida — usado como key p/ re-semear a store. */
  version: number;
  reload: () => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CurrentUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    getAccountData()
      .then((result) => {
        if (active) {
          setData(result);
          setVersion((v) => v + 1);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Comunicação entre MFEs: quando o remote Angular altera transações
  // (criar/editar/excluir), ele emite `transactions:changed` no bus. O
  // dashboard React recarrega a conta para atualizar saldo e gráficos.
  useEffect(() => {
    const unsubscribe = bus.on(TRANSACTION_EVENTS.CHANGED, () => reload());
    return unsubscribe;
  }, [reload]);

  return (
    <AccountContext.Provider value={{ data, loading, error, version, reload }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
