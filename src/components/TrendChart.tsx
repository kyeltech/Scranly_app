import React from 'react';
import Svg, {Circle, Line, Polyline, Text as SvgText} from 'react-native-svg';
import {useTheme} from '../theme';
import {sevenDayAverage} from '../domain/weight';
import type {Reading} from '../domain/weight';

type Props = {
  readings: Reading[];
  /** Where you would be, day by day, if you hit the goal exactly. */
  paceFrom: number;
  paceTo: number;
  width?: number;
  height?: number;
};

/**
 * Three marks, three shapes: dots are daily readings (noise), the solid line is
 * the 7-day average (the number that counts), the dashed line is the on-pace
 * line. Never colour alone — the legend beside it names each one.
 */
export default function TrendChart({
  readings,
  paceFrom,
  paceTo,
  width = 340,
  height = 152,
}: Props) {
  const t = useTheme();
  const left = 30;
  const right = width - 6;
  const top = 10;
  const bottom = height - 24;

  const values = readings.map(r => r.kg);
  const lo = Math.floor(Math.min(...values, paceTo) * 2) / 2 - 0.4;
  const hi = Math.ceil(Math.max(...values, paceFrom) * 2) / 2 + 0.2;

  const x = (i: number) => left + ((right - left) * i) / (readings.length - 1);
  const y = (kg: number) => bottom - ((bottom - top) * (kg - lo)) / (hi - lo);

  const averages = readings
    .map((_, i) => ({i, kg: sevenDayAverage(readings, i)}))
    .filter(p => !Number.isNaN(p.kg) && p.i >= 6);

  const gridLines: number[] = [];
  for (let g = Math.ceil(lo); g <= hi; g += 1) {
    gridLines.push(g);
  }

  const head = averages[averages.length - 1];

  return (
    <Svg width={width} height={height}>
      {gridLines.map(g => (
        <React.Fragment key={g}>
          <Line x1={left} y1={y(g)} x2={right} y2={y(g)} stroke={t.line} strokeWidth={1} />
          <SvgText
            x={left - 8}
            y={y(g) + 3.5}
            fontSize={10}
            fill={t.textMuted}
            textAnchor="end">
            {String(g)}
          </SvgText>
        </React.Fragment>
      ))}

      <Line
        x1={x(0)}
        y1={y(paceFrom)}
        x2={x(readings.length - 1)}
        y2={y(paceTo)}
        stroke={t.status.under}
        strokeWidth={2}
        strokeDasharray="5 5"
        strokeLinecap="round"
      />

      {readings.map((r, i) => (
        <Circle key={r.dayIndex} cx={x(i)} cy={y(r.kg)} r={2.6} fill={t.textMuted} />
      ))}

      <Polyline
        points={averages.map(p => `${x(p.i)},${y(p.kg)}`).join(' ')}
        fill="none"
        stroke={t.text}
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {head ? (
        <Circle
          cx={x(head.i)}
          cy={y(head.kg)}
          r={6}
          fill={t.text}
          stroke={t.bg}
          strokeWidth={2}
        />
      ) : null}
    </Svg>
  );
}
