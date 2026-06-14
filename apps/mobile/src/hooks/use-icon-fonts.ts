import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function useIconFonts() {
  return useFonts({
    ...FontAwesome.font,
    ...Ionicons.font,
    ...MaterialIcons.font,
  });
}
