export interface StoredSession {
  accessToken: string;
  user: {
    userId?: string;
    login: string;
    fullName: string;
    firstName: string;
  };
}

export function getSession(): StoredSession | null {
  try {
    return JSON.parse(localStorage.getItem('bb_session_user') || 'null');
  } catch {
    return null;
  }
}

export function getSessionUser() {
  return getSession()?.user ?? null;
}

export function getCurrentUserId(): string | undefined {
  return getSessionUser()?.userId;
}

export function getToken(): string | null {
  return getSession()?.accessToken ?? sessionStorage.getItem('token');
}

export function clearSession(): void {
  localStorage.removeItem('bb_session_user');
  sessionStorage.removeItem('token');
}
