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
    
  console.log("SESSION_KEY:", SESSION_KEY);
  console.log("RAW:", raw);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
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
  
  console.log("Salvando:", { accessToken, user });

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
