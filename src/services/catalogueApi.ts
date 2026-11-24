import type { Market, Product } from "../data/catalog";

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Catalogue request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export function fetchProduct(pnc: string): Promise<Product> {
  return request<Product>(`/api/products?pnc=${encodeURIComponent(pnc)}`);
}

export function fetchDemoProducts(): Promise<Product[]> {
  return request<Product[]>("/api/products/demo");
}

export function fetchMarkets(pnc: string): Promise<Market[]> {
  return request<Market[]>(`/api/products/${encodeURIComponent(pnc)}/markets`);
}
