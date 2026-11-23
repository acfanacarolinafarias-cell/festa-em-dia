import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native';

export async function copyText(text: string) {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

export async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
