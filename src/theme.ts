import {useColorScheme} from 'react-native';
import type {ImageSourcePropType} from 'react-native';

/**
 * Scranly design tokens. Every colour in the app comes from here.
 *
 * Two layers:
 *   1. `brand` — fixed colours that never change with the theme.
 *   2. `palettes.light` / `palettes.dark` — everything else, read through
 *      `useTheme()` so the app follows the phone's appearance setting.
 *
 * These mirror the design system at
 * https://claude.ai/artifact/HrQY1B8RcEUdSJhUAETPAi — if you change a value
 * here, change it there too.
 */

/** Fixed, theme-independent. Lime is lime in both themes. */
export const brand = {
  lime: '#C2F24D',
  limeDeep: '#8FC72E',
  onLime: '#16281F',
  ink900: '#16281F', // the dark green band, and the launch screens
  black900: '#0C0C0C',
  white: '#FFFFFF',
} as const;

/** Kept for older imports. Prefer `brand` or `useTheme()`. */
export const colors = {
  lime: brand.lime,
  limeDeep: brand.limeDeep,
  ink: brand.ink900,
  black: brand.black900,
  white: brand.white,
  paper: '#FAFBF5',
  muted: '#77856B',
} as const;

export type ThemeName = 'light' | 'dark';

export type Palette = {
  /** App background. */
  bg: string;
  /** Cards, sheets and rows raised off the background. */
  surface: string;
  /** Hairline dividers and card edges. */
  line: string;
  /** Border on an unfilled control: the add-food plus circle, inputs. */
  controlLine: string;
  /** Primary text. */
  text: string;
  /** Secondary text: portions, timestamps, helper lines. */
  textMuted: string;
  /** A heading for something not filled in yet, e.g. an unlogged meal. */
  textFaint: string;
  /**
   * A soft filled shape that is not a card: chips, the search field, the
   * round icon buttons, the meal tiles in the diary. No border, just fill.
   */
  fill: string;
  /** The unfilled part of the calorie ring and of the macro bars. */
  track: string;
  /** A selected chip or segment. */
  chipOnBg: string;
  chipOnText: string;
  /** How the day is going against the budget. */
  status: {under: string; close: string; over: string};
  /** Macro colours on the app background: ring segments and macro bars. */
  macro: {protein: string; carbs: string; fat: string; fibre: string};
  /** Drop shadow under the two action buttons. Flat in dark; surfaces lift instead. */
  buttonShadow: {
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: {width: number; height: number};
    elevation: number;
  };
  statusBar: 'dark-content' | 'light-content';
};

/**
 * The camera on the Scan screen is dark in both themes — it is a viewfinder,
 * not a page — so its colours sit outside the palette.
 */
export const camera = {
  bgTop: '#33392F',
  bgMid: '#1B2018',
  bgBottom: '#0F120E',
  reticle: brand.lime,
  control: 'rgba(255,255,255,0.16)',
  text: brand.white,
} as const;

export const palettes: Record<ThemeName, Palette> = {
  light: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    line: '#F0F2EA',
    controlLine: '#CDD6C5',
    text: '#16281F',
    textMuted: '#7C8A7A',
    textFaint: '#B6C0B0',
    fill: '#F3F6EC',
    track: '#EEF1E6',
    chipOnBg: '#16281F',
    chipOnText: '#FFFFFF',
    status: {under: '#2F7D4F', close: '#A8731A', over: '#B23F36'},
    macro: {
      protein: '#1F6F8B',
      carbs: '#A8731A',
      fat: '#6D5399',
      fibre: '#4B7A3F',
    },
    buttonShadow: {
      shadowColor: '#16281F',
      shadowOpacity: 0.22,
      shadowRadius: 20,
      shadowOffset: {width: 0, height: 6},
      elevation: 6,
    },
    statusBar: 'dark-content',
  },

  dark: {
    bg: '#10160F',
    surface: '#1A231A',
    line: '#243024',
    controlLine: '#3A4A38',
    text: '#EAF0E4',
    textMuted: '#93A392',
    textFaint: '#55654F',
    fill: '#1E281E',
    track: '#243024',
    chipOnBg: '#EAF0E4',
    chipOnText: '#10160F',
    status: {under: '#6AC78A', close: '#E7B34A', over: '#E4726A'},
    macro: {
      protein: '#5FB6D4',
      carbs: '#E0A94A',
      fat: '#B096DB',
      fibre: '#8CC47C',
    },
    // Shadows read as mud on a dark ground; surfaces lift instead.
    buttonShadow: {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: {width: 0, height: 0},
      elevation: 0,
    },
    statusBar: 'light-content',
  },
};

/**
 * The palette for whatever the phone is set to right now. Re-renders on its
 * own when the user flips appearance, so screens never read `palettes` direct.
 *
 *   const t = useTheme();
 *   <View style={{backgroundColor: t.bg}} />
 */
export function useTheme(): Palette {
  return palettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

/** The theme's name, when a component needs to branch rather than pick a colour. */
export function useThemeName(): ThemeName {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

/* ------------------------------------------------------------------ *
 * Launch schemes — splash and loading only.                          *
 *                                                                    *
 * These are deliberately NOT theme-aware: the launch screen must      *
 * match the native boot splash exactly or the handover flashes, and   *
 * the native one is a single fixed image.                             *
 * ------------------------------------------------------------------ */

/**
 * If you change ACTIVE_SCHEME, regenerate the static boot splash so its
 * background matches `splash.background` exactly:
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
      background: brand.lime,
      foreground: brand.ink900,
      tag: 'rgba(22, 40, 31, 0.62)',
      mark: require('./assets/mark-ink.png'),
      statusBar: 'dark-content',
    },
    loading: {
      background: brand.ink900,
      foreground: brand.lime,
      track: 'rgba(194, 242, 77, 0.18)',
      status: '#8DA08C',
      forkBase: require('./assets/fork-base-lime.png'),
      statusBar: 'light-content',
    },
  },

  // Dark green throughout, white mark. Quiet, keeps a trace of the brand.
  ink: {
    splash: {
      background: brand.ink900,
      foreground: brand.white,
      tag: 'rgba(255, 255, 255, 0.62)',
      mark: require('./assets/mark-white.png'),
      statusBar: 'light-content',
    },
    loading: {
      background: brand.ink900,
      foreground: brand.white,
      track: 'rgba(255, 255, 255, 0.18)',
      status: '#94A594',
      forkBase: require('./assets/fork-base-white.png'),
      statusBar: 'light-content',
    },
  },

  // True black, white mark. Flat and neutral.
  black: {
    splash: {
      background: brand.black900,
      foreground: brand.white,
      tag: 'rgba(255, 255, 255, 0.62)',
      mark: require('./assets/mark-white.png'),
      statusBar: 'light-content',
    },
    loading: {
      background: brand.black900,
      foreground: brand.white,
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

/* ------------------------------------------------------------------ *
 * Metrics and type — the same in both themes.                        *
 * ------------------------------------------------------------------ */

export const spacing = {xs: 4, sm: 8, md: 16, lg: 24, xl: 40} as const;

export const radius = {sm: 8, md: 16, lg: 28, pill: 999} as const;

/**
 * Typefaces. The files live in src/assets/fonts and are linked into both
 * native projects, so these names work on iOS and Android alike.
 *
 * Archivo throughout: Bold for the wordmark, titles and the one big number,
 * Regular and SemiBold for everything read and counted. Open-licence and
 * bundled, so nothing is fetched at runtime.
 */
export const fonts = {
  display: 'Archivo-Bold',
  body: 'Archivo-Regular',
  bodyStrong: 'Archivo-SemiBold',
} as const;

const nums = {fontVariant: ['tabular-nums' as const]};

export const type = {
  brand: {fontFamily: fonts.display, fontSize: 38, letterSpacing: -1},
  brandSmall: {fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.5},
  title: {fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.5},
  screenTitle: {fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.4},
  sectionTitle: {fontFamily: fonts.display, fontSize: 17, letterSpacing: -0.2},
  tag: {fontFamily: fonts.bodyStrong, fontSize: 11, letterSpacing: 5},
  body: {fontFamily: fonts.body, fontSize: 15, lineHeight: 22},
  bodyStrong: {fontFamily: fonts.bodyStrong, fontSize: 15, lineHeight: 22},
  caption: {fontFamily: fonts.body, fontSize: 13, lineHeight: 18},
  label: {fontFamily: fonts.bodyStrong, fontSize: 11, letterSpacing: 2},
  /** The one big number: calories left, inside the ring. */
  figureHero: {
    fontFamily: fonts.display,
    fontSize: 54,
    letterSpacing: -2,
    lineHeight: 54,
    ...nums,
  },
  figureXl: {fontFamily: fonts.display, fontSize: 44, letterSpacing: -1, ...nums},
  figureLg: {fontFamily: fonts.display, fontSize: 38, letterSpacing: -1.4, ...nums},
  figureMd: {fontFamily: fonts.bodyStrong, fontSize: 17, ...nums},
  figureSm: {fontFamily: fonts.bodyStrong, fontSize: 15, ...nums},
  status: {fontFamily: fonts.body, fontSize: 13},
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
