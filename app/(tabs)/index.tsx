import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { Header } from '@/components/header';
import { useTheme, withAlpha } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { user } = useUser();
  const { colors } = useTheme();
  const name = user?.firstName ?? user?.username ?? 'there';
  const tint = withAlpha(colors.ACCENT, 0.14);

  // Placeholder content — swap for your app's real data.
  const stats: { icon: IconName; num: string; label: string }[] = [
    { icon: 'cube-outline', num: '128', label: 'Items' },
    { icon: 'flash-outline', num: '24', label: 'Active' },
  ];
  const recent: { icon: IconName; title: string; sub: string }[] = [
    { icon: 'document-text-outline', title: 'First item', sub: 'Updated just now' },
    { icon: 'star-outline', title: 'Second item', sub: 'Yesterday' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.BG }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header />

        <View style={styles.greetBlock}>
          <Text style={[styles.greet, { color: colors.TEXT_SECONDARY }]}>{greeting()}</Text>
          <Text style={[styles.name, { color: colors.TEXT_PRIMARY }]}>{name}</Text>
        </View>

        <Pressable style={[styles.search, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <Ionicons name="search-outline" size={18} color={colors.TEXT_MUTED} />
          <Text style={{ color: colors.TEXT_MUTED, fontSize: 15 }}>Search</Text>
        </Pressable>

        <View style={styles.statRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.stat, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
              <View style={[styles.iconCircle, { backgroundColor: tint }]}>
                <Ionicons name={s.icon} size={18} color={colors.ACCENT} />
              </View>
              <Text style={[styles.statNum, { color: colors.TEXT_PRIMARY }]}>{s.num}</Text>
              <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Recent</Text>
        <View style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          {recent.map((r, i) => (
            <View key={r.title}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />}
              <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
                <View style={[styles.iconCircle, { backgroundColor: tint }]}>
                  <Ionicons name={r.icon} size={18} color={colors.ACCENT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.TEXT_PRIMARY }]}>{r.title}</Text>
                  <Text style={[styles.rowSub, { color: colors.TEXT_SECONDARY }]}>{r.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.TEXT_MUTED} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 32 },
  greetBlock: { marginTop: 18 },
  greet: { fontSize: 15 },
  name: { fontSize: 32, fontWeight: '600', letterSpacing: -0.6, marginTop: 2 },
  search: {
    marginTop: 18,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  statRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  stat: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 16 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 24, fontWeight: '600', letterSpacing: -0.5, marginTop: 12 },
  statLabel: { fontSize: 13, marginTop: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginTop: 26, marginBottom: 12 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 15, paddingVertical: 13 },
  rowTitle: { fontSize: 15, fontWeight: '500' },
  rowSub: { fontSize: 13, marginTop: 1 },
  divider: { height: 1, marginLeft: 63 },
});
