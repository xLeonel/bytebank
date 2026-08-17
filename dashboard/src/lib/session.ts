const SESSION_KEY = "bb_session_user";

export type SessionUser = {
  userId?: string;
  login: string;
  fullName: string;
  firstName: string;
};

export type Session = {
  accessToken: string;
  user: SessionUser;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/**
 * Lê o `exp` do JWT (em milissegundos) sem validar assinatura — quem valida de
 * verdade é o backend. Aqui só serve para não jogar o usuário numa tela logada
 * que vai falhar inteira com 401.
 */
function getTokenExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Sessão utilizável: existe e o token ainda não expirou.
 *
 * Token que não expõe `exp` é tratado como válido de propósito — o servidor é
 * a autoridade, e derrubar o usuário por um formato que não sabemos ler seria
 * pior que deixar a chamada falhar com 401.
 */
export function hasValidSession(): boolean {
  const session = getSession();
  if (!session?.accessToken || !session.user) return false;
  const expiraEm = getTokenExpiry(session.accessToken);
  return expiraEm === null || expiraEm > Date.now();
}

export function getSessionUser(): SessionUser | null {
  return getSession()?.user ?? null;
}

export function getCurrentUserId(): string | undefined {
  return getSessionUser()?.userId;
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function setSession(accessToken: string, user: SessionUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ accessToken, user } satisfies Session)
  );
}

export function setSessionUser(user: SessionUser) {
  const token = getAccessToken();
  if (token) setSession(token, user);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
