import React from 'react';
import Svg, {Circle} from 'react-native-svg';

export type Arc = {
  colour: string;
  /** 0–1 of the way round. Values above 1 are clamped; draw the overflow as a second arc. */
  fraction: number;
};

type Props = {
  size?: number;
  strokeWidth?: number;
  trackColour: string;
  /** Drawn in order from twelve o'clock, so a full lap can sit under an overflow arc. */
  arcs: Arc[];
  label?: string;
};

export default function Ring({
  size = 240,
  strokeWidth = 18,
  trackColour,
  arcs,
  label,
}: Props) {
  const centre = size / 2;
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;

  return (
    <Svg width={size} height={size} accessibilityLabel={label}>
      <Circle
        cx={centre}
        cy={centre}
        r={radius}
        fill="none"
        stroke={trackColour}
        strokeWidth={strokeWidth}
      />
      {arcs.map((arc, i) => {
        const fraction = Math.max(0, Math.min(arc.fraction, 1));
        if (fraction === 0) {
          return null;
        }
        return (
          <Circle
            key={i}
            testID="ring-arc"
            cx={centre}
            cy={centre}
            r={radius}
            fill="none"
            stroke={arc.colour}
            strokeWidth={strokeWidth}
            strokeLinecap={fraction >= 1 ? 'butt' : 'round'}
            strokeDasharray={`${circumference * fraction} ${circumference}`}
            transform={`rotate(-90 ${centre} ${centre})`}
          />
        );
      })}
    </Svg>
  );
}
