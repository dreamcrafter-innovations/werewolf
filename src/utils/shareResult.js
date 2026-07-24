// shareResult.js
// Captures a ref'd View as an image and opens the native share sheet.
// Falls back gracefully on web (copies text to clipboard) and when
// expo-sharing is unavailable.
import { Platform, Share } from 'react-native';

export async function shareResultCard(viewShotRef, { title, message }) {
  try {
    if (Platform.OS === 'web') {
      // Web: no native share sheet for images — use Web Share API if available
      if (navigator.share) {
        await navigator.share({ title, text: message });
      } else {
        await navigator.clipboard.writeText(`${title}\n${message}`);
        alert('Copied to clipboard!');
      }
      return;
    }

    // Native: capture the card as a PNG then share
    if (!viewShotRef?.current) throw new Error('ref not ready');
    if (typeof viewShotRef.current.capture !== 'function') throw new Error('ViewShot not available');
    const uri = await viewShotRef.current.capture();

    let Sharing;
    try { Sharing = require('expo-sharing'); } catch (_) { Sharing = null; }
    const canShare = Sharing && (await Sharing.isAvailableAsync());
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: title,
        UTI: 'public.png',
      });
    } else {
      // Fallback: text-only share via RN Share
      await Share.share({ message: `${title}\n${message}` });
    }
  } catch (e) {
    // User cancelled or permissions denied — silent fail
    if (e?.message && !e.message.includes('cancel')) {
      console.warn('[shareResult]', e.message);
    }
  }
}
