import type { Category, Destination, Information, Reason } from './types';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!/^https?:\/\//.test(API_URL)) throw new Error('Set EXPO_PUBLIC_API_URL in .env to your Django API address, including /api.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_URL}/${path}`, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`The server could not complete this request (${response.status}). Please try again.`);
    return await response.json() as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('The connection timed out. Check your connection and try again.');
    throw error;
  } finally { clearTimeout(timeout); }
}
async function list<T>(path: string): Promise<T[]> {
  const data = await request<T[] | { results: T[] }>(path);
  return Array.isArray(data) ? data : data.results;
}
export const getCategories = () => list<Category>('categories/');
export const getDestinations = () => list<Destination>('destinations/');
export function getInformation(search: string, category: string, destination: string) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (category) params.set('category', category);
  if (destination) params.set('destination', destination);
  return list<Information>(`information/?${params}`);
}
export const getDetail = (id: number) => request<Information>(`information/${id}/`);
export const submitReport = (id: number, reason: Reason, comment: string) => request('reports/', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ information_entry: id, reason, comment: comment.trim() }),
});
