const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_user_role";
const EMAIL_KEY = "auth_user_email";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined";
}

export function getAuthToken(): string | null {
  if (!canUseBrowserStorage()) {
    return null;
  }
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getAuthRole(): string | null {
  if (!canUseBrowserStorage()) {
    return null;
  }
  return sessionStorage.getItem(ROLE_KEY);
}

export function setAuthSession(token: string, role: string, email: string): void {
  if (!canUseBrowserStorage()) {
    return;
  }
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(ROLE_KEY, role);
  sessionStorage.setItem(EMAIL_KEY, email);
}

export function clearAuthSession(): void {
  if (!canUseBrowserStorage()) {
    return;
  }
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
}

export function clearLegacyPersistentAuth(): void {
  if (!canUseBrowserStorage()) {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
