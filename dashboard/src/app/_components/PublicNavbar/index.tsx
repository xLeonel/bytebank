import Link from "next/link";
import { AccountAccessButton } from "./AccountAccessButton";

type PublicNavbarProps = {
  /** Mostra o CTA "Abrir minha conta" (esconder na própria página de cadastro). */
  showRegister?: boolean;
  /** Mostra o CTA "Já tenho conta" (esconder na própria página de login). */
  showLogin?: boolean;
};

/**
 * Navbar das páginas públicas (início, 404, login, cadastro).
 * Layout ancorado: logo + links à esquerda, ações à direita — não "samba" ao navegar.
 * Os CTAs são contextuais: cada página de auth mostra apenas a ação oposta.
 */
export function PublicNavbar({ showRegister = true, showLogin = true }: PublicNavbarProps) {
  return (
    <nav className="w-full bg-[var(--bb-primary)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        {/* Esquerda: logo + navegação */}
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" aria-label="Página inicial Bytebank" className="shrink-0">
            <img
              src="/bytebank-logo.svg"
              alt="Bytebank"
              width={146}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="hidden sm:flex gap-4 sm:gap-6 text-base">
            <Link href="/sobre" className="hover:text-gray-300">Sobre</Link>
            <Link href="/servicos" className="hover:text-gray-300">Serviços</Link>
          </div>
        </div>

        {/* Direita: ações */}
        <div className="flex items-center gap-3">
          {showRegister && (
            <Link
              href="/cadastro"
              className="px-3 py-2 text-base sm:px-4 bg-[var(--bb-warning)] text-[var(--bb-dark)] rounded font-bold hover:opacity-90"
            >
              Abrir minha conta
            </Link>
          )}
          {showLogin && <AccountAccessButton />}
        </div>
      </div>
    </nav>
  );
}
