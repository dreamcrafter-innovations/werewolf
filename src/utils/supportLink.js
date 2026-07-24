export const KO_FI_URL = 'https://ko-fi.com/dreamcrafterinnovations';

export function isSupportLinkVisible() {
  return true; // Show on iOS, Android, and web
}

export async function openSupportLink(openUrl, platformOS) {
  if (platformOS === 'web' && typeof globalThis?.open === 'function') {
    globalThis.open(KO_FI_URL, '_blank', 'noopener,noreferrer');
    return;
  }
  await openUrl(KO_FI_URL);
}
