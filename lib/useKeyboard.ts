import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Current keyboard height in px (0 when hidden).
 *
 * Why this exists rather than `KeyboardAvoidingView` or
 * `automaticallyAdjustKeyboardInsets`:
 *
 * - `automaticallyAdjustKeyboardInsets` is **iOS only**. On Android it does
 *   nothing, so submit buttons sit under the keyboard.
 * - `KeyboardAvoidingView` has no working `behavior` on Android either, and
 *   modern Expo apps run edge-to-edge, which stops the window resizing for the
 *   IME — so the usual Android fallback doesn't apply.
 *
 * Measuring the height ourselves works identically on both platforms, needs no
 * native module, and lets a screen decide what to do with the space.
 *
 * @example
 * const kb = useKeyboardHeight();
 * <ScrollView contentContainerStyle={{ paddingBottom: kb + 24 }} />
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // iOS gets `will*` so layout animates in step with the keyboard;
    // Android only reliably emits `did*`.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent as 'keyboardDidShow', (e) => {
      setHeight(e.endCoordinates?.height ?? 0);
    });
    const hide = Keyboard.addListener(hideEvent as 'keyboardDidHide', () => setHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
