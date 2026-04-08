const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function parseJson(response: Response) {
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const error = typeof data.error === "string" ? data.error : "Request failed";
    throw new Error(error);
  }
  return data;
}

export async function apiGet(path: string, walletAddress?: string | null) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: walletAddress
      ? {
          "x-wallet-address": walletAddress
        }
      : undefined,
    cache: "no-store"
  });
  return parseJson(response);
}

export async function apiPost(
  path: string,
  body: unknown,
  walletAddress?: string | null
) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(walletAddress ? { "x-wallet-address": walletAddress } : {})
    },
    body: JSON.stringify(body ?? {})
  });
  return parseJson(response);
}

export async function apiPatch(
  path: string,
  body: unknown,
  walletAddress?: string | null
) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(walletAddress ? { "x-wallet-address": walletAddress } : {})
    },
    body: JSON.stringify(body ?? {})
  });
  return parseJson(response);
}
