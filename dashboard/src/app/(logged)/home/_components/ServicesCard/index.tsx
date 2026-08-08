import Link from "next/link";
import { ArrowRightLeft, ReceiptText } from "lucide-react";

const CARD_CLS =
  "w-36 h-32 bg-gray-50 border border-gray-200 rounded-md flex flex-col " +
  "items-center justify-center gap-3 hover:bg-gray-100 transition cursor-pointer";

export function ServicesCard() {
  return (
    <section className="bg-white rounded-md p-8 min-h-[260px]">
      <h2 className="text-lg font-bold mb-6">
        Confira os serviços disponíveis
      </h2>
      <div className="flex gap-6">
        <Link href="/nova-transacao" className={CARD_CLS}>
          <ArrowRightLeft
            aria-hidden
            size={32}
            style={{ color: "var(--bb-primary, #374C34)" }}
          />
          <span className="text-sm font-semibold">Nova transação</span>
        </Link>
        
        <Link href="/extrato" className={CARD_CLS}>
          <ReceiptText
            aria-hidden
            size={32}
            style={{ color: "var(--bb-primary, #374C34)" }}
          />
          <span className="text-sm font-semibold">Extrato</span>
        </Link>
      </div>
    </section>
  );
}
