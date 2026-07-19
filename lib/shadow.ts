import { Platform, ViewStyle } from 'react-native';

/**
 * Cross-platform drop shadow.
 *
 * The Android trap this exists to prevent:
 *
 * `elevation` shadows are drawn from a view's *outline*, and React Native
 * derives that outline from the view's background drawable. A view with
 * `elevation` but **no `backgroundColor`** has no outline, so Android falls
 * back to the plain bounds rectangle — producing a hard-edged dark rectangle
 * that ignores `borderRadius` and bleeds through any translucent surface
 * stacked on top of it.
 *
 * That's a common shape in RN code: a wrapper view carrying the shadow, with
 * the visible surface (a gradient, a clipped child) inside it.
 *
 * So:
 * - **Transparent wrapper** → use this helper. iOS gets a shadow, Android gets
 *   none, and nothing renders a stray rectangle.
 * - **Opaque view** → set `backgroundColor` and add `elevation` directly;
 *   Android then has a correct rounded outline to work from.
 *
 * @example
 * const styles = StyleSheet.create({
 *   card: { borderRadius: 16, ...softShadow({ y: 12, radius: 20, opacity: 0.35 }) },
 * });
 */
export function softShadow({
  color = '#000',
  y = 10,
  radius = 18,
  opacity = 0.3,
}: {
  color?: string;
  /** Vertical offset. */
  y?: number;
  /** Blur radius. */
  radius?: number;
  opacity?: number;
} = {}): ViewStyle {
  if (Platform.OS !== 'ios') return {};
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: y },
    shadowRadius: radius,
    shadowOpacity: opacity,
  };
}
