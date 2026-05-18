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

        // If route is missing, try the same path on the next base URL.
        if (response.status === 404) {
          continue;
        }

        const contentType = response.headers.get('content-type') ?? '';
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
