import { PublicNavbar } from "@/app/_components/PublicNavbar";

export const metadata = {
  title: "Sobre | Bytebank",
};

export default function Sobre() {
  return (
    <div className="min-h-screen bg-[#e7efe5] flex flex-col">
      <PublicNavbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--bb-dark,#332E2B)] mb-6">
          Sobre o <span className="text-[var(--bb-warning,#f59e0b)]">Bytebank</span>
        </h1>

        <div className="bg-white rounded-md p-10 flex flex-col gap-5 text-base text-gray-700 leading-relaxed">
          <p>
            O Bytebank é um banco digital feito para dar a você mais liberdade e controle sobre
            a sua vida financeira. Sem agências, sem burocracia e sem tarifas escondidas — tudo
            na palma da sua mão.
          </p>
          <p>
            Nossa missão é tornar o dia a dia com o dinheiro simples e transparente: acompanhar o
            saldo, registrar transações e entender para onde vai o seu dinheiro deveria ser fácil
            para todo mundo.
          </p>
          <p>
            Este projeto foi desenvolvido como parte do Tech Challenge da FIAP, com foco em uma
            experiência moderna, acessível e consistente do começo ao fim.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-md p-8 text-center">
            <p className="text-4xl font-bold text-[var(--bb-primary,#374C34)]">100%</p>
            <p className="text-base text-gray-600 mt-2">Digital, sem agências</p>
          </div>
          <div className="bg-white rounded-md p-8 text-center">
            <p className="text-4xl font-bold text-[var(--bb-primary,#374C34)]">R$ 0</p>
            <p className="text-base text-gray-600 mt-2">De tarifa de manutenção</p>
          </div>
          <div className="bg-white rounded-md p-8 text-center">
            <p className="text-4xl font-bold text-[var(--bb-primary,#374C34)]">24/7</p>
            <p className="text-base text-gray-600 mt-2">Sua conta sempre disponível</p>
          </div>
        </div>
      </main>
    </div>
  );
}
