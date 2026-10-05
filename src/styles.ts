import {StyleSheet} from 'react-native';
import {brand, camera, fonts, radius, spacing, type as type_} from './theme';

/**
 * Every arrangement in the app, in one place.
 *
 * React Native has no cascade, so a shared stylesheet buys none of what a
 * global CSS file buys: each component still names the styles it uses, and the
 * names here are scoped per surface so they cannot collide. What it does buy is
 * a single place to see the app's spacing and sizing at once — which is how the
 * drift this file was made to fix became visible in the first place.
 *
 * Colour and type are NOT here. They live in theme.ts, because they have to
 * flip between light and dark and two components must agree on them. This file
 * is arrangement: boxes, gaps, sizes, the occasional fixed dimension off a
 * board.
 *
 * Each export is one surface's styles. Components import theirs aliased:
 *
 *     import {today as styles} from '../styles';
 *
 * so a call site reads `styles.header` wherever it lives.
 */

/* ---- src/screens/AboutYou.tsx ---- */
export const aboutYou = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40},
  lede: {...type_.body, marginTop: 8},
  units: {marginTop: 20},
  row: {flexDirection: 'row', gap: 10, marginTop: 14},
  legend: {marginTop: 22, marginBottom: 4},
  level: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tick: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: {backgroundColor: brand.lime},
  tickOff: {borderWidth: 1.5},
  levelText: {flex: 1},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12, paddingTop: spacing.sm},
});

/* ---- src/screens/AddFood.tsx ---- */
export const addFood = StyleSheet.create({
  screen: {flex: 1},
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {flex: 1},
  round: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginTop: 18,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingLeft: 14,
    paddingRight: 7,
    borderRadius: 15,
    borderWidth: 2,
  },
  searchFocused: {borderColor: brand.lime},
  searchResting: {borderColor: 'transparent'},
  input: {...type_.body, flex: 1, paddingVertical: 0},
  clear: {
    width: 19,
    height: 19,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scan: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: brand.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, marginTop: 18},
  filter: {paddingHorizontal: 15, paddingVertical: 8, borderRadius: radius.pill},
  filterLabel: {...type_.caption, fontWeight: '600'},
  list: {paddingHorizontal: spacing.lg, paddingTop: 18},
  listHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  none: {...type_.caption, lineHeight: 20, paddingVertical: 16},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {flex: 1},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: 7},
  yours: {...type_.label, fontSize: 10, letterSpacing: 0.8},
  control: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});

/* ---- src/components/AnimatedSplash.tsx ---- */
export const animatedSplash = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  mark: {width: 116, height: 116},
  brand: {...type_.brand},
  tag: {...type_.tag},
});

/* ---- src/screens/scan/CameraRefused.tsx ---- */
export const cameraRefused = StyleSheet.create({
  head: {flexDirection: 'row', alignItems: 'center', gap: 10},
  icon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {flex: 1},
  body: {...type_.body, fontSize: 14, marginTop: 14},
  gap: {height: 20},
  gapSm: {height: 10},
});

/* ---- src/screens/CreateFood.tsx ---- */
export const createFood = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 40},
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  shortcutIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: brand.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutText: {flex: 1},
  shortcutTitle: {...type_.bodyStrong, fontSize: 14.5},
  shortcutSub: {...type_.caption, fontSize: 12.5},
  field: {marginTop: 14},
  row: {flexDirection: 'row', gap: 10, marginTop: 14},
  calories: {flex: 0, width: 132},
  legend: {marginTop: 20},
  macros: {flexDirection: 'row', gap: 10, marginTop: 2},
  note: {...type_.caption, fontSize: 12.5, lineHeight: 18, marginTop: 16},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12, paddingTop: spacing.sm},
});

/* ---- src/screens/DayPicker.tsx ---- */
export const dayPicker = StyleSheet.create({
  root: {flex: 1},
  scrim: {backgroundColor: 'rgba(8,10,7,0.42)'},
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  round: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  weekday: {
    ...type_.caption,
    fontSize: 11,
    fontWeight: '600',
    width: `${100 / 7}%`,
    textAlign: 'center',
    marginBottom: 6,
  },
  cell: {
    width: `${100 / 7}%`,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  date: {...type_.body, fontSize: 15, fontWeight: '600'},
  dateOn: {fontWeight: '700'},
  hollow: {borderWidth: 1},
  mark: {width: 5, height: 5, borderRadius: radius.pill},
  legend: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 6, height: 6, borderRadius: radius.pill},
  legendLabel: {...type_.caption, fontSize: 11.5},
  gap: {height: spacing.lg},
});

/* ---- src/screens/Goal.tsx ---- */
export const goal = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40},
  lede: {...type_.body, fontSize: 14.5, lineHeight: 21, marginTop: 8},
  row: {flexDirection: 'row', gap: 10, marginTop: 20},
  legend: {marginTop: 20},
  horizons: {flexDirection: 'row', gap: 6, marginTop: 8},
  horizon: {flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.pill},
  horizonLabel: {...type_.caption, fontWeight: '600'},
  verdict: {borderRadius: 16, padding: 16, marginTop: 20},
  rateRow: {flexDirection: 'row', alignItems: 'baseline', gap: 8},
  rate: {...type_.figureLg, fontSize: 30, letterSpacing: -1, lineHeight: 30},
  rateUnit: {...type_.bodyStrong, fontSize: 14},
  verdictLine: {fontSize: 14, marginTop: 8},
  detail: {...type_.caption, lineHeight: 19, marginTop: 5},
  detailSecond: {marginTop: 9},
  suggestion: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12},
  suggestionChip: {
    ...type_.caption,
    fontWeight: '700',
    backgroundColor: brand.lime,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  suggestionRate: {...type_.caption, fontSize: 12.5},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12, paddingTop: spacing.sm},
});

/* ---- src/ui/index.tsx ---- */
export const kit = StyleSheet.create({
  screen: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerText: {flex: 1},
  overline: {...type_.label, marginBottom: 1},
  round: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 56,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonSub: {...type_.caption, opacity: 0.6, fontWeight: '600'},
  segmented: {flexDirection: 'row', gap: 6},
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  segmentLabel: {...type_.caption, fontWeight: '600'},
  field: {flex: 1},
  fieldBox: {flexDirection: 'row', alignItems: 'center', marginTop: 6},
  fieldRing: {borderWidth: 2, borderColor: brand.lime},
  fieldValueRequired: {fontWeight: '700'},
  fieldValue: {...type_.body, flex: 1},
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noteText: {...type_.caption, flex: 1, fontSize: 12.5, lineHeight: 18},
  panel: {borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16},
  panelText: {...type_.body, fontSize: 13.5, lineHeight: 20, marginTop: 6},
  textAction: {...type_.bodyStrong, textAlign: 'center'},
  progress: {flexDirection: 'row', gap: 5, paddingHorizontal: spacing.lg},
  progressBar: {flex: 1, height: 4, borderRadius: radius.pill},
});

/* ---- src/components/LoadingScreen.tsx ---- */
export const loadingScreen = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  art: {width: 116, height: 116},
  // Tines sit on the crossbar and grow upward from it.
  tine: {
    position: 'absolute',
    width: 10,
    borderRadius: 5,
    transformOrigin: 'bottom',
  },
  forkBase: {position: 'absolute', top: 0, left: 0, width: 116, height: 116},
  brand: {...type_.brandSmall},
  barTrack: {width: 128, height: 5, borderRadius: 3, overflow: 'hidden'},
  barFill: {width: 48, height: 5, borderRadius: 3},
  status: {...type_.status},
});

/* ---- src/screens/Method.tsx ---- */
export const method = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40},
  lede: {...type_.body, marginTop: 8},
  card: {borderRadius: 16, borderWidth: 2, padding: 14, marginTop: 12},
  cardChosen: {borderColor: brand.lime},
  cardResting: {borderColor: 'transparent'},
  tickOn: {backgroundColor: brand.lime},
  tickOff: {borderWidth: 1.5},
  cardHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  tick: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  what: {...type_.caption, lineHeight: 20, marginTop: 8},
  why: {...type_.caption, lineHeight: 18, marginTop: 8, opacity: 0.75},
  note: {marginTop: 18},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12, paddingTop: spacing.sm},
});

/* ---- src/screens/PortionEdit.tsx ---- */
export const portionEdit = StyleSheet.create({
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  amount: {flexDirection: 'row', alignItems: 'baseline', gap: 6},
  figure: {...type_.figureHero, fontSize: 44, lineHeight: 46},
  unit: {...type_.title, fontSize: 20},
  stepper: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: {width: 18, height: 2.8, borderRadius: 2},
  presets: {flexDirection: 'row', gap: 6, marginTop: 18},
  preset: {flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.pill},
  presetLabel: {...type_.caption, fontWeight: '700'},
  units: {marginTop: 10},
  guide: {borderRadius: 14, padding: 14, marginTop: 16},
  guideText: {...type_.caption, lineHeight: 20, marginTop: 5},
  liveRow: {flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 18},
  live: {...type_.figureLg, fontSize: 26},
  spacer: {height: spacing.lg},
});

/* ---- src/screens/scan/ReadDebug.tsx ---- */
export const readDebug = StyleSheet.create({
  wrap: {padding: 16, maxHeight: 340, gap: 10},
  head: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {fontSize: 11, letterSpacing: 2, fontWeight: '600'},
  copy: {borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7},
  copyText: {fontSize: 13, fontWeight: '600'},
  scroll: {maxHeight: 250},
  line: {fontSize: 12, fontFamily: 'Menlo', lineHeight: 17},
});

/* ---- src/screens/ScalePhoto.tsx ---- */
export const scalePhoto = StyleSheet.create({
  head: {flexDirection: 'row', alignItems: 'center', gap: 8},
  dot: {width: 7, height: 7, borderRadius: radius.pill, backgroundColor: brand.lime},
  figureRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 10},
  figure: {
    ...type_.figureHero,
    fontSize: 56,
    lineHeight: 56,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
  },
  unit: {...type_.title, fontSize: 18, fontWeight: '600', paddingBottom: 6},
  body: {...type_.caption, lineHeight: 19, marginTop: 12},
  note: {marginTop: 16},
  gap: {height: spacing.lg},
  gapSm: {height: 10},
});

/* ---- src/screens/scan/sheets.tsx ---- */
export const scanSheets = StyleSheet.create({
  code: {...type_.title, fontSize: 20, marginTop: 4},
  progress: {height: 4, borderRadius: radius.pill, marginTop: 16, overflow: 'hidden'},
  progressFill: {width: '46%', height: 4, borderRadius: radius.pill},
  skeleton: {height: 13, borderRadius: 7, marginTop: 10},
  skeletonTall: {height: 18, marginTop: 22},

  failHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  failIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failText: {flex: 1},
  body: {...type_.body, fontSize: 14, marginTop: 14},

  figureRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 16},
  figure: {...type_.figureLg, fontSize: 38, lineHeight: 38},
  unit: {...type_.caption, fontWeight: '600', paddingBottom: 4},
  macroChips: {flexDirection: 'row', gap: 6, marginLeft: 'auto'},
  chip: {alignItems: 'center', borderRadius: 12, paddingHorizontal: 11, paddingVertical: 7},
  chipLabel: {...type_.label, fontSize: 10, letterSpacing: 0.8},
  serving: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  servingRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  meals: {marginTop: 14},

  legend: {marginTop: 18},
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  radioOff: {borderWidth: 1.5},
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingText: {flex: 1},
  weigh: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15},
  weighLabel: {flex: 1},

  plateHead: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  plateHeadText: {flex: 1},
  plateTotal: {alignItems: 'flex-end'},
  plateUnit: {...type_.caption, fontSize: 12},
  plateFigure: {...type_.figureLg, fontSize: 26, lineHeight: 26},
  caveat: {marginTop: 14},
  plateList: {flex: 1, marginTop: 4},
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tick: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: brand.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateRowText: {flex: 1, minWidth: 0},
  plateName: {flexDirection: 'row', alignItems: 'center', gap: 6},
  flag: {
    ...type_.label,
    fontSize: 10,
    letterSpacing: 0.6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  guessRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1},
  guess: {
    ...type_.caption,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  missing: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12},
  missingLabel: {...type_.body, fontSize: 14, fontWeight: '600'},

  readHead: {flexDirection: 'row', alignItems: 'center', gap: 8},
  readDot: {width: 7, height: 7, borderRadius: radius.pill, backgroundColor: brand.lime},
  readTitle: {marginTop: 6},
  columns: {flexDirection: 'row', gap: 6, marginTop: 14},
  column: {flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.pill},
  columnLabel: {...type_.bodyStrong, fontSize: 14},
  columnNote: {...type_.caption, fontSize: 12.5, lineHeight: 18, marginTop: 12},
  labelList: {flex: 1, marginTop: 2},
  unread: {marginBottom: 8},
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  labelName: {...type_.bodyStrong, fontSize: 14.5},
  labelUnder: {...type_.body, fontSize: 14.5, paddingLeft: 14},
  labelFigure: {
    ...type_.bodyStrong,
    fontSize: 15,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },

  gapLg: {height: spacing.lg},
  gapSm: {height: 10},
});

/* ---- src/screens/Settings.tsx ---- */
export const settings = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingBottom: 40},
  legend: {marginTop: 22},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {flex: 1},
  note: {...type_.caption, lineHeight: 18, marginTop: 2},
  footer: {...type_.caption, lineHeight: 18, marginTop: 18},
});

/* ---- src/ui/Sheet.tsx ---- */
export const sheet = StyleSheet.create({
  sheet: {
    marginTop: 'auto',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
  },
  /**
   * A DEFINITE height, not maxHeight. A scrolling list inside a tall sheet
   * fills the space with flex: 1, and flex against an auto-height parent
   * resolves to nothing — which rendered the plate and label sheets with their
   * chrome and an invisible list. 74% is the boards' 614–616 of 844.
   */
  tall: {height: '74%'},
  grab: {width: 38, height: 4, borderRadius: 99, alignSelf: 'center', marginBottom: 16},
});

/* ---- src/components/subjects.tsx ---- */
/**
 * The only styles here with colours written into them, on purpose.
 *
 * These are drawings of things, not UI: a barcode on off-white card, a plate of
 * food, a printed nutrition panel. A photograph does not invert in dark mode
 * and neither should its stand-in — a white label that turned dark would stop
 * reading as a label. So these stay literal while everything else takes its
 * colour from the theme.
 */
export const subjects = StyleSheet.create({
  pack: {
    position: 'absolute',
    top: 208,
    left: 78,
    width: 236,
    height: 152,
    borderRadius: 10,
    backgroundColor: '#ECE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    transform: [{rotate: '-3deg'}],
  },
  bars: {flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 62},
  bar: {height: 62, backgroundColor: '#1B1B1B'},
  barLight: {backgroundColor: '#ECE9DF'},
  digits: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 3,
    color: '#4A4A46',
  },

  plate: {
    position: 'absolute',
    top: 250,
    alignSelf: 'center',
    width: 230,
    height: 230,
    borderRadius: 999,
    backgroundColor: '#F3F1EA',
  },
  food: {position: 'absolute'},
  chicken: {
    top: 34,
    left: 30,
    width: 96,
    height: 74,
    borderRadius: 40,
    backgroundColor: '#B4763C',
  },
  rice: {top: 44, left: 120, width: 80, height: 66, borderRadius: 32, backgroundColor: '#EFEADD'},
  broccoli: {
    top: 120,
    left: 52,
    width: 64,
    height: 58,
    borderRadius: 26,
    backgroundColor: '#4E7A37',
  },
  oil: {top: 126, left: 122, width: 60, height: 52, borderRadius: 24, backgroundColor: '#C9A13F'},

  label: {
    position: 'absolute',
    top: 214,
    left: 70,
    width: 250,
    height: 290,
    borderRadius: 8,
    backgroundColor: '#F6F4EC',
    paddingHorizontal: 14,
    paddingTop: 14,
    transform: [{rotate: '1.5deg'}],
  },
  labelTitle: {fontFamily: fonts.bodyStrong, fontSize: 12, letterSpacing: 0.4, color: '#1B1B1B'},
  labelHead: {
    flexDirection: 'row',
    marginTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#CFCCC2',
  },
  labelHeadText: {flex: 1, fontFamily: fonts.body, fontSize: 9, color: '#5A5A55'},
  labelRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DFD5',
  },
  labelCell: {flex: 1, fontFamily: fonts.body, fontSize: 10, color: '#1B1B1B'},
  labelFigure: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#1B1B1B',
    textAlign: 'right',
  },

  scale: {
    position: 'absolute',
    top: 250,
    left: 62,
    width: 266,
    height: 200,
    borderRadius: 18,
    backgroundColor: '#20252A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lcd: {backgroundColor: '#0E1210', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 26},
  lcdText: {
    fontFamily: fonts.display,
    fontSize: 44,
    letterSpacing: 2,
    color: '#9FE870',
  },
  scaleUnit: {
    ...type_.label,
    position: 'absolute',
    bottom: 14,
    fontSize: 10,
    letterSpacing: 2,
    color: '#5C6560',
  },
});

/* ---- src/screens/Targets.tsx ---- */
export const targets = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40},
  lede: {...type_.body, marginTop: 8},
  headline: {flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 22},
  figure: {...type_.figureHero, fontSize: 56, lineHeight: 56},
  unit: {paddingBottom: 6},
  row: {paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth},
  rowHead: {flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between'},
  rowRight: {flexDirection: 'row', alignItems: 'baseline', gap: 8},
  track: {height: 6, borderRadius: radius.pill, marginTop: 8, overflow: 'hidden'},
  fill: {height: 6},
  fibreNote: {marginTop: 6},
  note: {marginTop: 16},
  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    paddingTop: spacing.sm,
    gap: 18,
  },
});

/* ---- src/screens/Today.tsx ---- */
export const today = StyleSheet.create({
  screen: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  dayName: {flex: 1},
  dateLabel: {...type_.caption, fontSize: 12},
  headerActions: {flexDirection: 'row', gap: spacing.sm},
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
    paddingHorizontal: spacing.lg,
  },
  stepperLabel: {...type_.caption, fontSize: 12},
  weekNote: {alignItems: 'center', marginTop: -6, marginBottom: 14},
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  weekLabel: {...type_.caption, fontSize: 12.5},
  weekFigure: {fontWeight: '700'},
  diaryHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  edit: {...type_.caption, fontWeight: '600'},
  starterLede: {...type_.caption, marginTop: 3, marginBottom: 6},
  starterAdd: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: brand.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill},
  chipLabel: {...type_.caption, fontWeight: '600'},
  cog: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm},
  ringCentre: {position: 'absolute', alignItems: 'center'},
  caption: {...type_.caption, fontWeight: '600', marginTop: spacing.xs},
  macros: {flexDirection: 'row', gap: 14, paddingHorizontal: spacing.lg},
  macro: {flex: 1, alignItems: 'center'},
  macroValue: {marginTop: 3},
  macroTrack: {
    height: 5,
    borderRadius: radius.pill,
    marginTop: 7,
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  macroFill: {height: 5},
  diary: {paddingHorizontal: spacing.lg, marginTop: spacing.lg},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mealTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {flex: 1},
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  secondary: {borderWidth: 1},
  button: {
    flex: 1,
    height: 54,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

/* ---- src/components/Viewfinder.tsx ---- */
export const viewfinder = StyleSheet.create({
  root: {flex: 1, backgroundColor: brand.black900},
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  round: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: camera.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {...type_.bodyStrong, color: camera.text},
  frame: {position: 'absolute', left: '50%'},
  corner: {position: 'absolute', width: 34, height: 34},
  tl: {top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12},
  tr: {top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12},
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: 24,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(10,12,9,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  dot: {width: 7, height: 7, borderRadius: radius.pill, backgroundColor: brand.lime},
  hintText: {...type_.caption, fontSize: 12.5, fontWeight: '600', color: camera.hint},
  tabs: {
    flexDirection: 'row',
    gap: 2,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(10,12,9,0.55)',
  },
  tab: {paddingHorizontal: 18, paddingVertical: 8, borderRadius: radius.pill},
  tabOn: {backgroundColor: 'rgba(255,255,255,0.22)'},
  tabLabel: {...type_.caption, fontSize: 13.5, fontWeight: '600', color: 'rgba(255,255,255,0.55)'},
  tabLabelOn: {fontWeight: '700', color: camera.text},
  shutter: {
    width: 70,
    height: 70,
    borderRadius: radius.pill,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {width: 56, height: 56, borderRadius: radius.pill, backgroundColor: camera.text},
  footnote: {...type_.caption, fontSize: 12.5, color: 'rgba(255,255,255,0.5)'},
  working: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.lg,
  },
  dots: {flexDirection: 'row', gap: 7},
  workingDot: {width: 9, height: 9, borderRadius: radius.pill, backgroundColor: brand.lime},
  workingTitle: {
    ...type_.title,
    fontSize: 19,
    letterSpacing: -0.3,
    color: camera.text,
    textAlign: 'center',
  },
  workingBody: {
    ...type_.caption,
    fontSize: 13.5,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    maxWidth: 250,
  },
  cancel: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {...type_.bodyStrong, color: camera.text},
});

/* ---- src/screens/WeighIn.tsx ---- */
export const weighIn = StyleSheet.create({
  screen: {flex: 1},
  figureWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: 40,
  },
  figureText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  figure: {...type_.figureHero, fontSize: 68, lineHeight: 70},
  unit: {...type_.title, fontSize: 24},
  stepper: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minus: {width: 20, height: 2.8, borderRadius: 2},
  context: {...type_.caption, textAlign: 'center', marginTop: 10},
  note: {paddingHorizontal: spacing.lg, marginTop: 30},
  photo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginTop: 16,
  },
  photoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {flex: 1},
  actions: {
    marginTop: 'auto',
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
  },
});

/* ---- src/screens/WeightTrend.tsx ---- */
export const weightTrend = StyleSheet.create({
  screen: {flex: 1},
  body: {paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 30},
  legend: {flexDirection: 'row', gap: 14, marginTop: 6, paddingLeft: 8},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  legendLabel: {...type_.caption, fontSize: 11.5},
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  weeksHead: {marginTop: 22},
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  weekLabel: {...type_.body, fontSize: 14, flex: 1},
  weekAverage: {...type_.body, fontSize: 14},
  weekChange: {...type_.bodyStrong, fontSize: 14, width: 62, textAlign: 'right'},
  stat: {flex: 1},
  statValue: {marginTop: 3},
  verdict: {borderRadius: 16, padding: 16, marginTop: 18},
  verdictHead: {flexDirection: 'row', alignItems: 'center', gap: 8},
  badge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verdictLine: {...type_.body, marginTop: 10},
  verdictDetail: {...type_.caption, lineHeight: 19, marginTop: 6},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 12},
});

/* ---- src/screens/Welcome.tsx ---- */
export const welcome = StyleSheet.create({
  screen: {flex: 1},
  body: {flex: 1, justifyContent: 'center', paddingHorizontal: 26},
  word: {marginTop: 22},
  tag: {marginTop: 6},
  pitch: {...type_.body, fontSize: 16, lineHeight: 24, marginTop: 26},
  small: {...type_.caption, marginTop: 14},
  actions: {paddingHorizontal: spacing.lg, paddingBottom: 20, gap: spacing.lg},
  invite: {...type_.bodyStrong, textAlign: 'center'},
});
