import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '@/lib/theme';

/**
 * Generic app logo — a rounded-square monogram built from the app's initials.
 * Swap this out for your own brand mark (e.g. an <SvgXml /> or <Image />).
 */
export function Logo({ size = 88 }: { size?: number }) {
  const { colors } = useTheme();
  const name = Constants.expoConfig?.name ?? 'App';
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size * 0.26,
          backgroundColor: colors.ACCENT,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
});
