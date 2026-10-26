interface ShareData { title: string; text: string; url: string }
export async function shareArticle(data: ShareData, services: { share?: (value: ShareData) => Promise<void>; copy?: (value: string) => Promise<void> }): Promise<'shared' | 'cancelled' | 'copied' | 'manual'> {
  if (services.share) {
    try { await services.share(data); return 'shared'; }
    catch (error) { if (error instanceof Error && error.name === 'AbortError') return 'cancelled'; }
  }
  try { if (!services.copy) return 'manual'; await services.copy(data.url); return 'copied'; }
  catch { return 'manual'; }
}
