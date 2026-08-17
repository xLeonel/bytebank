"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearSession, hasValidSession } from "@/lib/session";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Não basta existir sessão: com token expirado o usuário entrava na área
    // logada e toda chamada falhava com 401, resultando numa tela vazia sem
    // explicação. Sessão inválida é descartada antes de mandar para o login,
    // senão o "Já tenho conta" cairia aqui de novo no próximo clique.
    if (!hasValidSession()) {
      clearSession();
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}
