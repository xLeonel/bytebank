import { PublicNavbar } from "@/app/_components/PublicNavbar";
import { Wallet, Send, Banknote, CreditCard, BarChart3, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Serviços | Bytebank",
};

const SERVICES = [
  {
    Icon: Wallet,
    title: "Conta digital gratuita",
    description: "Abra sua conta em minutos, sem custo fixo e sem tarifa de manutenção.",
  },
  {
    Icon: Send,
    title: "Transferências e Pix",
    description: "Envie e receba dinheiro na hora, com Pix e transferências entre contas.",
  },
  {
    Icon: Banknote,
    title: "Saques sem custo",
    description: "Saque gratuitamente 4x por mês em qualquer caixa Banco 24h.",
  },
  {
    Icon: CreditCard,
    title: "Cartão sem anuidade",
    description: "Cartão para compras no crédito e no débito, sem pagar mensalidade.",
  },
  {
    Icon: BarChart3,
    title: "Extrato e análises",
    description: "Acompanhe suas transações e veja gráficos do seu desempenho financeiro.",
  },
  {
    Icon: ShieldCheck,
    title: "Segurança",
    description: "Autenticação protegida e seus dados tratados com responsabilidade.",
  },
];

export default function Servicos() {
  return (
    <div className="min-h-screen bg-[#e7efe5] flex flex-col">
      <PublicNavbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--bb-dark,#332E2B)] mb-2">
          Nossos <span className="text-[var(--bb-warning,#f59e0b)]">serviços</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Tudo o que você precisa para cuidar do seu dinheiro em um só lugar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(({ Icon, title, description }) => (
            <div key={title} className="bg-white rounded-md p-8 flex flex-col gap-3">
              <Icon className="h-11 w-11 text-[var(--bb-warning,#f59e0b)]" />
              <h2 className="text-xl font-bold text-[var(--bb-dark,#332E2B)]">{title}</h2>
              <p className="text-base text-gray-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
