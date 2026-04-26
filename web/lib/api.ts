export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pulkitworks.info";

export interface ApiErrorShape {
  message?: string;
  error?: string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const url = path.startsWith("http")
    ? path
    : path.startsWith("/api/")
      ? path
      : `${API_BASE_URL}${path}`;

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Network error: unable to reach server");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      (data as ApiErrorShape | null)?.message ||
      (data as ApiErrorShape | null)?.error ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}
