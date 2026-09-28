/**
 * Web-only fixes for two React Native APIs that silently do nothing in a
 * browser. Import once from the root entry/layout; native is untouched.
 *
 * 1) Alert.alert — React Native Web ships `Alert.alert` as a no-op, so on the web build every
 * confirmation ("Delete this?"), error message and multi-choice prompt in
 * the app silently did nothing — and any action behind an Alert button never
 * ran. This maps Alert.alert onto the browser's own dialogs:
 *   - 0–1 buttons  -> window.alert, then that button's onPress
 *   - 1 action + cancel (or 2 buttons) -> window.confirm
 *   - 3+ buttons   -> window.prompt with a numbered list of choices
 *
 * 2) Share.share — React Native Web only works where navigator.share exists
 * (mostly mobile browsers). On desktop Chrome/Firefox it rejects, and every
 * "Share" button in the app did nothing. Fall back to copying the text to
 * the clipboard and saying so.
 */
import { Alert, Platform, Share } from 'react-native';

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  Alert.alert = (title, message, buttons) => {
    const text = [title, message].filter(Boolean).join('\n\n');
    const list = Array.isArray(buttons) ? buttons.filter(Boolean) : [];
    if (list.length <= 1) {
      window.alert(text);
      list[0]?.onPress?.();
      return;
    }
    const cancel =
      list.find((b) => b.style === 'cancel') ??
      (list.length === 2 ? list[0] : undefined);
    const actions = list.filter((b) => b !== cancel);
    if (actions.length === 1) {
      if (window.confirm(text)) actions[0]?.onPress?.();
      else cancel?.onPress?.();
      return;
    }
    const menu = actions.map((b, i) => `${i + 1}. ${b.text ?? 'OK'}`).join('\n');
    const answer = window.prompt(`${text}\n\n${menu}\n\nType a number:`, '1');
    const picked = actions[Number(answer) - 1];
    if (picked) picked.onPress?.();
    else cancel?.onPress?.();
  };

  const nativeShare = Share.share.bind(Share);
  // @ts-ignore -- same call shape as Share.share, narrowed to what the apps pass
  Share.share = async (content) => {
    // A local file/data URI (e.g. a captured share card) is useless as text.
    const link = content?.url && /^https?:/.test(content.url) ? content.url : undefined;
    const text = [content?.message, link].filter(Boolean).join('\n');
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        return await nativeShare({ message: content?.message ?? '', title: content?.title, url: link });
      } catch (e) {
        // AbortError = the person closed the share sheet; don't also copy.
        if (e && e.name === 'AbortError') return { action: Share.dismissedAction };
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      window.alert('Copied to the clipboard — paste it into WhatsApp, email or any chat.');
    } catch {
      window.prompt('Copy this text:', text);
    }
    return { action: Share.sharedAction };
  };
}
