import React from 'react';
import Svg, {Circle, Ellipse, G, Path, Rect} from 'react-native-svg';
import type {MeasureGlyph} from '../domain/servings';

/**
 * The drawings on the serving guide's cards: a hand, two cupped hands, a fist,
 * half a hand, a palm, two thumbs, a spoon, a glass, a coin.
 *
 * Drawn rather than photographed. The guides this one is modelled on use
 * photographs of food beside a tennis ball, which means an asset pipeline, a
 * licence for every picture, and a look that belongs to no other screen in the
 * app. Nine line drawings in the icon style cost none of that and say the same
 * thing — and a hand is the subject anyway, not the food.
 *
 * `ink` draws the outline and `accent` whatever is being measured: the food in
 * the hand, the fill line in the glass, the shaded half of the hand.
 */
type P = {name: MeasureGlyph; ink: string; accent: string; size?: number};

/** The open hand the handful, palm and half-hand glyphs are all built from. */
const HAND = [
  'M20 30V17a3.4 3.4 0 016.8 0v11',
  'M26.8 28V14a3.4 3.4 0 016.8 0v14',
  'M33.6 28V17a3.4 3.4 0 016.8 0v12',
  'M40.4 30V21a3.4 3.4 0 016.8 0v18c0 8.6-6.8 14.8-15.4 14.8S16.4 47.6 16.4 39v-8.6a3.4 3.4 0 016.8 0v2.4',
];

export default function MeasureGlyph({name, ink, accent, size = 64}: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Hand name={name} ink={ink} />
      <Contents name={name} ink={ink} accent={accent} />
    </Svg>
  );
}

/** The outline, which is a hand on six of the nine. */
function Hand({name, ink}: {name: MeasureGlyph; ink: string}) {
  const line = {
    fill: 'none',
    stroke: ink,
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'handful' || name === 'palm' || name === 'halfHand') {
    return (
      <G {...line}>
        {HAND.map(d => (
          <Path key={d} d={d} />
        ))}
      </G>
    );
  }

  if (name === 'cupped') {
    // Two hands meeting: one bowl, a seam down the middle, a thumb either side.
    return (
      <G {...line}>
        <Path d="M9 27c0 15 10.5 26 23 26s23-11 23-26" />
        <Path d="M32 53V31" />
        <Path d="M9 27c0-4.3 2.5-7.4 5.5-7.4S20 22.7 20 27" />
        <Path d="M55 27c0-4.3-2.5-7.4-5.5-7.4S44 22.7 44 27" />
      </G>
    );
  }

  if (name === 'fist') {
    return (
      <G {...line}>
        <Rect x={16} y={24} width={34} height={27} rx={12} />
        <Path d="M23 24v-4a3 3 0 016 0v4" />
        <Path d="M31 24v-5a3 3 0 016 0v5" />
        <Path d="M39 24v-4a3 3 0 016 0v4" />
        <Path d="M16 33h-3a4 4 0 000 8h3" />
      </G>
    );
  }

  if (name === 'thumbs') {
    return (
      <G {...line}>
        <Rect x={17} y={18} width={13} height={30} rx={6.5} />
        <Rect x={34} y={18} width={13} height={30} rx={6.5} />
        <Path d="M20.5 27c1.8-1.8 5.2-1.8 6 0" />
        <Path d="M37.5 27c1.8-1.8 5.2-1.8 6 0" />
      </G>
    );
  }

  if (name === 'spoon') {
    return (
      <G {...line}>
        <Ellipse cx={32} cy={24} rx={13} ry={10} />
        <Path d="M32 34v20" />
      </G>
    );
  }

  if (name === 'glass') {
    return (
      <G {...line}>
        <Path d="M21 14h22l-3.2 38H24.2z" />
        <Path d="M22.6 28h18.8" />
      </G>
    );
  }

  // coin
  return (
    <G {...line}>
      <Circle cx={32} cy={32} r={17} />
      <Circle cx={32} cy={32} r={8} />
    </G>
  );
}

/** What is being measured, in the accent — the point of each drawing. */
function Contents({name, ink, accent}: {name: MeasureGlyph; ink: string; accent: string}) {
  if (name === 'handful') {
    return (
      <G fill={accent}>
        <Circle cx={26} cy={40} r={3} />
        <Circle cx={34} cy={44} r={3} />
        <Circle cx={41} cy={39} r={3} />
      </G>
    );
  }

  if (name === 'palm') {
    return (
      <G fill={accent} stroke={ink} strokeWidth={1.3}>
        <Ellipse cx={27} cy={41} rx={5} ry={3.6} />
        <Ellipse cx={38} cy={43} rx={5} ry={3.6} />
        <Ellipse cx={32} cy={48} rx={5} ry={3.6} />
      </G>
    );
  }

  if (name === 'halfHand') {
    // The half is the measure, so it is the half that is shaded.
    return (
      <G>
        <Path
          d="M40.4 30V21a3.4 3.4 0 016.8 0v18c0 8-5.9 13.9-13.6 14.7V30z"
          fill={accent}
          opacity={0.45}
        />
        <Path d="M32 12v42" stroke={accent} strokeWidth={2.2} strokeDasharray="4 4" />
      </G>
    );
  }

  if (name === 'cupped') {
    return (
      <G fill="none" stroke={accent} strokeWidth={2.4} strokeLinecap="round">
        <Path d="M17 33c4-5 9-5 13 0" />
        <Path d="M34 33c4-5 9-5 13 0" />
        <Path d="M24 41c4-5 9-5 13 0" />
      </G>
    );
  }

  if (name === 'spoon') {
    return <Ellipse cx={32} cy={24} rx={8} ry={5.6} fill={accent} />;
  }

  if (name === 'glass') {
    return <Path d="M22.6 28h18.8l-1.6 24H24.2z" fill={accent} opacity={0.5} />;
  }

  if (name === 'coin') {
    // The bunch of spaghetti through the hole.
    return (
      <G stroke={accent} strokeWidth={1.8} strokeLinecap="round" fill="none">
        <Path d="M29 25v14" />
        <Path d="M32 24v16" />
        <Path d="M35 25v14" />
      </G>
    );
  }

  return null;
}
