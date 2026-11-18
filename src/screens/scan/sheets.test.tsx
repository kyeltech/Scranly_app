import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {FoundSheet, ServingSheet} from './sheets';

/** A real Snickers, per 100 g, with the pack's 50 g serving alongside. */
const product = {
  barcode: '5000159461122',
  name: 'Snickers',
  brand: 'Mars',
  kcal: 481,
  proteinG: 8.6,
  carbsG: 60.5,
  fatG: 22.5,
};
const per100 = {id: 'per-100', label: 'Per 100 g', grams: 100, kcal: 481};
const perServing = {id: 'per-serving', label: 'Per serving (50 g)', grams: 50, kcal: 240};

describe('the found-product sheet', () => {
  it('shows the product, its per-100 g figures and the meal it will log to', async () => {
    await render(
      <FoundSheet product={product} serving={per100} meal="Lunch" />,
    );

    expect(screen.getByText('Snickers')).toBeTruthy();
    expect(screen.getByText('Mars · 5000159461122')).toBeTruthy();
    expect(screen.getByText('481')).toBeTruthy();
    expect(screen.getByText('8.6')).toBeTruthy();
    expect(screen.getByText('60.5')).toBeTruthy();
    expect(screen.getByText('22.5')).toBeTruthy();
    expect(screen.getByText('100 g · Per 100 g')).toBeTruthy();
    expect(screen.getByText('Add to lunch')).toBeTruthy();
  });

  it('scales the energy and macros to the chosen serving', async () => {
    await render(
      <FoundSheet product={product} serving={perServing} meal="Lunch" />,
    );

    // 240 kcal is 0.499 of the 481 per 100 g, so every macro is that share:
    // 8.6 -> 4.3, 60.5 -> 30.2, 22.5 -> 11.2.
    expect(screen.getByText('240')).toBeTruthy();
    expect(screen.getByText('4.3')).toBeTruthy();
    expect(screen.getByText('30.2')).toBeTruthy();
    expect(screen.getByText('11.2')).toBeTruthy();
  });

  it('opens the serving chooser and adds to the diary on demand', async () => {
    const onServing = jest.fn();
    const onAdd = jest.fn();
    await render(
      <FoundSheet
        product={product}
        serving={per100}
        meal="Lunch"
        onServing={onServing}
        onAdd={onAdd}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Change the serving'));
    await fireEvent.press(screen.getByText('Add to lunch'));

    expect(onServing).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});

describe('the serving chooser', () => {
  it('lists each serving with its grams and energy', async () => {
    await render(
      <ServingSheet
        product={product}
        servings={[per100, perServing]}
        chosen={per100}
      />,
    );

    expect(screen.getByText('How much?')).toBeTruthy();
    expect(screen.getByText('Snickers · Mars')).toBeTruthy();
    expect(screen.getByText('Per 100 g')).toBeTruthy();
    expect(screen.getByText('Per serving (50 g)')).toBeTruthy();
    expect(screen.getByText('100 g')).toBeTruthy();
    expect(screen.getByText('50 g')).toBeTruthy();
    expect(screen.getByText('240')).toBeTruthy();
    expect(screen.getByText('Weigh it — enter grams')).toBeTruthy();
    // The action names the chosen serving and its energy.
    expect(screen.getByText('Use Per 100 g')).toBeTruthy();
    expect(screen.getByText('481 kcal')).toBeTruthy();
  });

  it('chooses a serving, offers the scale, and uses the chosen one', async () => {
    const onChoose = jest.fn();
    const onWeigh = jest.fn();
    const onUse = jest.fn();
    await render(
      <ServingSheet
        product={product}
        servings={[per100, perServing]}
        chosen={per100}
        onChoose={onChoose}
        onWeigh={onWeigh}
        onUse={onUse}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Per serving (50 g)'));
    await fireEvent.press(screen.getByText('Weigh it — enter grams'));
    await fireEvent.press(screen.getByText('Use Per 100 g'));

    expect(onChoose).toHaveBeenCalledWith(perServing);
    expect(onWeigh).toHaveBeenCalledTimes(1);
    expect(onUse).toHaveBeenCalledTimes(1);
  });
});
