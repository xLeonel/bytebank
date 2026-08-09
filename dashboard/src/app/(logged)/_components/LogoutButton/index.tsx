"use client";

// variant="secondary" → transparent bg + coloured border (outline style).
// --bb-secondary scoped inline so only this button's shadow root gets
// the amber colour; other secondary buttons on the page are unaffected.
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";
import { bus, AUTH_EVENTS } from "@bytebank/mfe-events";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    bus.emit(AUTH_EVENTS.LOGOUT);
    router.push("/");
  };

  return (
    <bb-button
      label="Sair"
      variant="secondary"
      size="md"
      style={{
        "--bb-secondary":       "var(--bb-warning, #f59e0b)",
        "--button-hover-bg":    "var(--bb-primary, #374C34)",
        "--button-hover-color": "var(--bb-warning, #f59e0b)",
      }}
      onClick={handleLogout}
    />
  );
}
