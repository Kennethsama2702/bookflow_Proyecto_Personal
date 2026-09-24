const API_URL = "http://localhost:3000";

function csrfToken() {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("bookflow_csrf="))
    ?.split("=")[1];
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

export interface ApiError {
  error: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as ApiError).error || "Error desconocido");
  }
  return data as T;
}

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, fullName }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function refresh(): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": csrfToken() ?? "" },
  });
  return handleResponse<AuthResponse>(res);
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": csrfToken() ?? "" },
  });
}

export interface MeResponse {
  user: { id: string; email: string; fullName: string };
}

export type UserRole =
  | "ADMINISTRADOR"
  | "SUPERVISOR"
  | "PERSONAL_ACCESO"
  | "PERSONAL_CONFITERIA"
  | "CLIENTE";

export interface OrganizationResponse {
  id: string;
  name: string;
  role: UserRole;
}

export async function fetchOrganizations(
  token: string,
): Promise<{ organizations: OrganizationResponse[] }> {
  const res = await fetch(`${API_URL}/organizations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ organizations: OrganizationResponse[] }>(res);
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<MeResponse>(res);
}
