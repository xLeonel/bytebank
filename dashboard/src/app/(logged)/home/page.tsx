"use client";
import { getTodayFormatted } from "@/lib/format";
import { useAccount } from "@/contexts/Account";
import { BalanceCard } from "./_components/BalanceCard";
import { RecentTransactionsCard } from "./_components/RecentTransactionsCard";
import { ServicesCard } from "./_components/ServicesCard";
import { FinancialCharts } from "./_components/FinancialCharts";
import { getSessionUser } from "@/lib/session";

export default function HomePage() {
  const user = getSessionUser();
  const today = getTodayFormatted();
  const { data } = useAccount();

  return (
    <div className="grid grid-cols-[1fr_300px] gap-6 h-full items-stretch">
      <main className="flex flex-col gap-6">
        <BalanceCard
          greetingName={user?.firstName ?? "Teste"}
          today={today}
          accountType={data?.account.type ?? "Conta Corrente"}
          agency={data?.account.agency}
          account={data?.account.number}
        />
        <ServicesCard />
        <FinancialCharts />
      </main>

      <RecentTransactionsCard />
    </div>
  );
}
