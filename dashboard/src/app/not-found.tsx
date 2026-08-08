import Image from "next/image";
import Link from "next/link";
import { PublicNavbar } from "./_components/PublicNavbar";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <PublicNavbar />

      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-4">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Image
            src="/404-img.png"
            width={400}
            height={400}
            alt="Página não encontrada"
            loading="eager"
            priority
            className="w-full max-w-xs sm:max-w-sm h-auto object-contain"
          />
          <h1 className="text-center text-2xl font-semibold leading-snug">
            Página não encontrada
          </h1>
        </div>

        <Link
          href="/"
          className="px-6 py-2 bg-[var(--bb-warning)] text-[var(--bb-dark)] rounded font-bold hover:opacity-90"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
