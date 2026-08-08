"use client";
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Link from "next/link";
import { User } from "lucide-react";
import { AccountProvider, useAccount } from "@/contexts/Account";
import { TransactionsProvider } from "@/contexts/Transactions";
import { DsLoader } from "@/components/DsLoader";
import { Sidebar } from "./_components/Sidebar";
import { LogoutButton } from "./_components/LogoutButton";
import { AuthGuard } from "./_components/AuthGuard";
import { getSessionUser } from "@/lib/session";

function LoggedContent({ children }: { children: ReactNode }) {
  const user = getSessionUser();
  const { data, loading } = useAccount();

  return (
    <div className="min-h-screen w-full bg-[#e7efe5] flex flex-col">
      <header className="bg-[#374C34] text-white">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between gap-4">
          <Link href="/home" aria-label="Ir para a página inicial da sua conta" className="shrink-0">
            <img
              src="/bytebank-logo.svg"
              alt="Bytebank"
              width={146}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user?.fullName ?? "Teste"}</span>
            <span
              aria-hidden
              className="w-10 h-10 rounded-full border-2 border-[#f59e0b] flex items-center justify-center text-[#f59e0b]"
            >
              <User size={20} />
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-8 grid grid-cols-[220px_minmax(0,1fr)] gap-6">
        {/* Loads the DS Web Component library on the client side only */}
        <DsLoader />
        <Sidebar />
        {data ? (
          <TransactionsProvider
            initialBalance={data.account.balance}
            initialTransactions={data.transactions}
          >
            {children}
          </TransactionsProvider>
        ) : (
          <div className="flex items-center justify-center text-sm text-slate-500">
            {loading ? "Carregando sua conta..." : "Não foi possível carregar sua conta."}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoggedLayout() {
  return (
    <AuthGuard>
      <AccountProvider>
        <LoggedContent>
          <Outlet />
        </LoggedContent>
      </AccountProvider>
    </AuthGuard>
  );
}
