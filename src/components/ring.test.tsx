/**
 * The calorie ring's arc maths — the one piece of drawing logic in the app
 * that can be wrong rather than merely ugly.
 */
import React from 'react';
import {render} from '@testing-library/react-native';
import Ring from './Ring';

/**
 * Every node in the rendered tree that carries a dash pattern: the arcs.
 *
 * react-native-svg hands these to the native side already converted — the dash
 * array as numbers rather than a string, and the line cap as an enum where 0 is
 * butt and 1 is round. The assertions below read them in that form.
 */
function arcs(tree: unknown): {strokeDasharray?: number[]; strokeLinecap?: number}[] {
  const found: {strokeDasharray?: number[]; strokeLinecap?: number}[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== 'object') {
      return;
    }
    const n = node as {props?: Record<string, unknown>; children?: unknown};
    if (n.props?.strokeDasharray) {
      found.push(n.props as never);
    }
    walk(n.children);
  };
  walk(tree);
  return found;
}

const drawn = (view: {toJSON: () => unknown}) => arcs(view.toJSON());

describe('Ring', () => {
  it('draws nothing for an arc at zero, rather than a dot at twelve o’clock', async () => {
    const empty = await render(
      <Ring trackColour="#eee" arcs={[{colour: '#000', fraction: 0}]} />,
    );
    const some = await render(
      <Ring trackColour="#eee" arcs={[{colour: '#000', fraction: 0.5}]} />,
    );

    // The track carries no dash pattern, so only real arcs are counted.
    expect(drawn(empty)).toHaveLength(0);
    expect(drawn(some)).toHaveLength(1);
  });

  it('clamps an overflowing arc rather than winding past the top', async () => {
    const view = await render(
      <Ring trackColour="#eee" arcs={[{colour: '#000', fraction: 2.4}]} />,
    );

    // The pair arrives as strings from the native converter.
    const [filled, total] = (drawn(view)[0].strokeDasharray as unknown[]).map(Number);

    // A full lap, not two and a bit.
    expect(filled).toBeCloseTo(total, 5);
  });

  it('clamps a negative fraction to nothing', async () => {
    const view = await render(
      <Ring trackColour="#eee" arcs={[{colour: '#000', fraction: -1}]} />,
    );

    expect(drawn(view)).toHaveLength(0);
  });

  it('squares off a full lap and rounds a partial one', async () => {
    const full = await render(
      <Ring trackColour="#eee" arcs={[{colour: '#000', fraction: 1}]} />,
    );
    const part = await render(
      <Ring trackColour="#eee" arcs={[{colour: '#000', fraction: 0.4}]} />,
    );

    // A rounded cap on a closed lap overlaps its own start.
    expect(drawn(full)[0].strokeLinecap).toBe(0); // butt
    expect(drawn(part)[0].strokeLinecap).toBe(1); // round
  });
});
