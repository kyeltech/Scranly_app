import type {ImageSourcePropType} from 'react-native';

/**
 * Scranly design tokens. Every colour in the app comes from here.
 */
export const colors = {
  lime: '#C2F24D',
  limeDeep: '#8FC72E',
  ink: '#16281F', // very dark green
  black: '#0C0C0C',
  white: '#FFFFFF',
  paper: '#FAFBF5',
  muted: '#77856B',
} as const;

/**
 * The three launch schemes. Change ACTIVE_SCHEME to switch the app over.
 *
 * If you change it, also regenerate the static boot splash so its background
 * matches `splash.background` exactly, or the handover flashes:
 *
 *   npx react-native-bootsplash generate src/assets/bootsplash-logo.png \
 *     --background=<hex without #> --logo-width=120
 *
 * Use bootsplash-logo.png for lime, and mark-white.png for black or ink.
 */
export type SchemeName = 'lime' | 'ink' | 'black';

type Scheme = {
  splash: {
    background: string;
    foreground: string;
    tag: string;
    mark: ImageSourcePropType;
    statusBar: 'dark-content' | 'light-content';
  };
  loading: {
    background: string;
    foreground: string;
    track: string;
    status: string;
    forkBase: ImageSourcePropType;
    statusBar: 'dark-content' | 'light-content';
  };
};

export const schemes: Record<SchemeName, Scheme> = {
  // Lime tile, ink mark. The brightest, and the one the icon uses.
  lime: {
    splash: {
      background: colors.lime,
      foreground: colors.ink,
      tag: 'rgba(22, 40, 31, 0.62)',
      mark: require('./assets/mark-ink.png'),
      statusBar: 'dark-content',
    },
    loading: {
      background: colors.ink,
      foreground: colors.lime,
      track: 'rgba(194, 242, 77, 0.18)',
      status: '#8DA08C',
      forkBase: require('./assets/fork-base-lime.png'),
      statusBar: 'light-content',
    },
  },

  // Dark green throughout, white mark. Quiet, keeps a trace of the brand.
  ink: {
    splash: {
      background: colors.ink,
      foreground: colors.white,
      tag: 'rgba(255, 255, 255, 0.62)',
      mark: require('./assets/mark-white.png'),
      statusBar: 'light-content',
    },
    loading: {
      background: colors.ink,
      foreground: colors.white,
      track: 'rgba(255, 255, 255, 0.18)',
      status: '#94A594',
      forkBase: require('./assets/fork-base-white.png'),
      statusBar: 'light-content',
    },
  },

  // True black, white mark. Flat and neutral.
  black: {
    splash: {
      background: colors.black,
      foreground: colors.white,
      tag: 'rgba(255, 255, 255, 0.62)',
      mark: require('./assets/mark-white.png'),
      statusBar: 'light-content',
    },
    loading: {
      background: colors.black,
      foreground: colors.white,
      track: 'rgba(255, 255, 255, 0.18)',
      status: '#9A9A9A',
      forkBase: require('./assets/fork-base-white.png'),
      statusBar: 'light-content',
    },
  },
};

/** The scheme the app launches with. */
export const ACTIVE_SCHEME: SchemeName = 'lime';

export const scheme = schemes[ACTIVE_SCHEME];

export const spacing = {xs: 4, sm: 8, md: 16, lg: 24, xl: 40} as const;

export const radius = {sm: 8, md: 16, pill: 999} as const;

export const type = {
  brand: {fontSize: 38, fontWeight: '700' as const, letterSpacing: -1},
  brandSmall: {fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5},
  tag: {fontSize: 11, fontWeight: '600' as const, letterSpacing: 5},
  status: {fontSize: 13, fontWeight: '400' as const},
};

/** Splash timings in ms, matching the design preview. */
export const timing = {
  markIn: 820,
  brandIn: 620,
  brandDelay: 340,
  tagDelay: 560,
  holdAfter: 260,
  tineLoop: 1400,
  tineStagger: 180,
} as const;
