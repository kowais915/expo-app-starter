import { Keyboard, Text } from 'react-native';
import { render, screen, act } from '@testing-library/react-native';
import { useKeyboardHeight } from '@/lib/useKeyboard';

/**
 * The hook exists because the usual approaches are iOS-only, so what's worth
 * pinning is that it reports a height at all — and that it unsubscribes, since
 * a leaked listener outlives the screen and fires against an unmounted tree.
 *
 * We spy on `addListener` rather than emitting keyboard events: `Keyboard` has
 * no public emit API, and capturing the handlers works regardless of which
 * event names the hook picks for the platform under test.
 */

const listeners = new Map<string, (e: unknown) => void>();
let removeSpies: jest.Mock[] = [];

beforeEach(() => {
  listeners.clear();
  removeSpies = [];
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((event: string, cb: (e: unknown) => void) => {
    listeners.set(event, cb);
    const remove = jest.fn(() => listeners.delete(event));
    removeSpies.push(remove);
    return { remove };
  }) as never);
});

afterEach(() => jest.restoreAllMocks());

/** Fire whichever show/hide event this platform registered. */
function fire(kind: 'Show' | 'Hide', payload: unknown = {}) {
  const key = [...listeners.keys()].find((k) => k.includes(kind));
  if (!key) throw new Error(`no keyboard${kind} listener registered`);
  listeners.get(key)!(payload);
}

function Probe() {
  const height = useKeyboardHeight();
  return <Text testID="height">{String(height)}</Text>;
}

describe('useKeyboardHeight', () => {
  it('starts at zero', () => {
    render(<Probe />);
    expect(screen.getByTestId('height')).toHaveTextContent('0');
  });

  it('subscribes to both show and hide', () => {
    render(<Probe />);
    expect([...listeners.keys()].some((k) => k.includes('Show'))).toBe(true);
    expect([...listeners.keys()].some((k) => k.includes('Hide'))).toBe(true);
  });

  it('reports the keyboard height while it is open', async () => {
    render(<Probe />);

    await act(async () => {
      fire('Show', { endCoordinates: { height: 320 } });
    });

    expect(screen.getByTestId('height')).toHaveTextContent('320');
  });

  it('returns to zero when the keyboard hides', async () => {
    render(<Probe />);

    await act(async () => {
      fire('Show', { endCoordinates: { height: 320 } });
    });
    await act(async () => {
      fire('Hide');
    });

    expect(screen.getByTestId('height')).toHaveTextContent('0');
  });

  it('copes with a show event that carries no coordinates', async () => {
    render(<Probe />);

    // Defensive: some emulators and older Androids omit endCoordinates, and
    // reading `.height` off undefined would crash the screen rather than the
    // keyboard simply not being measured.
    await act(async () => {
      fire('Show', {});
    });

    expect(screen.getByTestId('height')).toHaveTextContent('0');
  });

  it('removes its listeners on unmount', () => {
    const { unmount } = render(<Probe />);
    expect(removeSpies).toHaveLength(2);

    unmount();

    // A surviving listener sets state on an unmounted component — quiet in
    // dev, a real leak once a user has visited many screens.
    expect(removeSpies.every((r) => r.mock.calls.length === 1)).toBe(true);
    expect(listeners.size).toBe(0);
  });
});
