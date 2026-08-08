"use client";

import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export function AccountAccessButton() {
  const router = useRouter();

  const handleClick = () => {
    if (getSessionUser()) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-3 py-2 text-base sm:px-4 sm:py-2 border border-white text-white rounded font-bold hover:bg-white hover:text-[var(--bb-dark)] cursor-pointer"
    >
      Já tenho conta
    </button>
  );
}
