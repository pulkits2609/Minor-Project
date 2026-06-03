const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

const baseCandidates = [
  configuredBaseUrl,
  'https://api.pulkitworks.info',
].filter((value): value is string => Boolean(value)).map(normalizeBaseUrl);

const API_BASE_URLS = Array.from(new Set(baseCandidates));

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const toAbsoluteUrl = (baseUrl: string, path: string) => {
  const normalizedPath = normalizePath(path);

  if (baseUrl.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${baseUrl}${normalizedPath.slice('/api'.length)}`;
  }

  return `${baseUrl}${normalizedPath}`;
};

type ApiErrorShape = {
  error?: unknown;
  message?: unknown;
  details?: unknown;
};

export async function readApiJson<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function getApiErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const { error, message, details } = data as ApiErrorShape;
    let msg = '';

    if (typeof error === 'string' && error.trim()) {
      msg = error;
    } else if (typeof message === 'string' && message.trim()) {
      msg = message;
    }

    if (typeof details === 'string' && details.trim()) {
      msg += `\n\nDetails:\n${details}`;
    }

    if (msg) {
      return msg;
    }
  }

  return fallback;
}

export async function apiFetchWithFallback(
  path: string,
  init?: RequestInit,
  fallbackPaths: string[] = []
): Promise<Response> {
  const allPaths = [path, ...fallbackPaths];
  const networkErrors: unknown[] = [];
  let lastHtmlResponse: Response | null = null;

  for (const currentPath of allPaths) {
    for (const baseUrl of API_BASE_URLS) {
      const url = toAbsoluteUrl(baseUrl, currentPath);

      try {
        const response = await fetch(url, init);
        const contentType = response.headers.get('content-type') ?? '';

        // HTML 404s usually mean the route is missing on that host. JSON 404s are
        // valid API responses, such as "User not found" from /auth/login.
        if (response.status === 404 && contentType.includes('text/html')) {
          continue;
        }

        if (contentType.includes('text/html')) {
          lastHtmlResponse = response;
          continue;
        }

        return response;
      } catch (error) {
        networkErrors.push(error);
      }
    }
  }

  if (lastHtmlResponse) {
    return lastHtmlResponse;
  }

  if (networkErrors.length > 0) {
    throw new Error('Network request failed for all configured API hosts.');
  }

  throw new Error('API endpoint not found on configured hosts.');
}

export { API_BASE_URLS };
