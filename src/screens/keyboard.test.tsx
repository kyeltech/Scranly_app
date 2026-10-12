import React from 'react';
import {render} from '@testing-library/react-native';
import type {ReactTestRendererJSON} from 'react-test-renderer';
import AboutYou from './AboutYou';
import CreateFood from './CreateFood';
import Goal from './Goal';
import {kyel} from '../fixtures/profile';

/**
 * Typing on a form screen, with the keyboard up.
 *
 * Two separate faults produced one complaint — "I can't get into the next
 * field". Tapping a second field only dismissed the keyboard, because without
 * `keyboardShouldPersistTaps` the first tap is swallowed closing it; and the
 * fields below the fold could not be reached at all, because the scroll view
 * did not know the keyboard was covering them.
 *
 * These assert the props rather than the behaviour, which is unusual here and
 * deliberate: neither effect exists without a real keyboard, so there is
 * nothing for a test to press. They are a regression guard, not a proof.
 */

type Node = ReactTestRendererJSON | string | null;

/** Every value a prop carries anywhere in the rendered tree. */
function valuesOf(prop: string, node: Node | Node[]): unknown[] {
  if (node === null || typeof node === 'string') {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap(child => valuesOf(prop, child));
  }
  const here = prop in node.props ? [node.props[prop]] : [];
  return [...here, ...valuesOf(prop, (node.children ?? []) as Node[])];
}

describe('a form screen with the keyboard up', () => {
  const screens: [string, React.ReactElement][] = [
    ['About you', <AboutYou profile={kyel} />],
    ['Create a food', <CreateFood />],
    ['Goal', <Goal profile={kyel} />],
  ];

  it.each(screens)('%s keeps a tap meant for another field', async (_name, element) => {
    const view = await render(element);

    expect(valuesOf('keyboardShouldPersistTaps', view.toJSON())).toContain(
      'handled',
    );
  });

  it.each(screens)('%s makes room for the keyboard', async (_name, element) => {
    const view = await render(element);

    expect(valuesOf('automaticallyAdjustKeyboardInsets', view.toJSON())).toContain(
      true,
    );
  });
});
