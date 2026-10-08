/**
 * Correcting a portion the photo guessed.
 *
 * The screen the design promises when it says a plate reading is "a starting
 * guess — correct one and Scranly remembers it". Its controls had never been
 * pressed: the stepper, the presets and the save.
 */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import PortionEdit from './PortionEdit';

describe('PortionEdit', () => {
  it('opens on the number the photo guessed, and says it was a guess', async () => {
    await render(<PortionEdit guessG={150} />);

    expect(screen.getByText('The photo guessed 150 g')).toBeTruthy();
  });

  it('steps up and down in fives', async () => {
    await render(<PortionEdit guessG={150} />);

    await fireEvent.press(screen.getByLabelText('More'));
    expect(screen.getByText('155')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Less'));
    await fireEvent.press(screen.getByLabelText('Less'));
    expect(screen.getByText('145')).toBeTruthy();
  });

  it('will not step below nothing', async () => {
    // Negative grams is not a portion, and a stepper is easy to lean on.
    await render(<PortionEdit guessG={5} />);

    await fireEvent.press(screen.getByLabelText('Less'));
    await fireEvent.press(screen.getByLabelText('Less'));
    await fireEvent.press(screen.getByLabelText('Less'));

    // The figure and the live kcal both read 0, which is the point.
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.queryByText('-5')).toBeNull();
    expect(screen.queryByText('-10')).toBeNull();
  });

  it('jumps to a preset, and marks it as the one chosen', async () => {
    await render(<PortionEdit guessG={150} />);

    await fireEvent.press(screen.getByText('200 g'));

    // The figure follows the preset...
    expect(screen.getByText('200')).toBeTruthy();
    // ...and that chip, not another, reports itself selected to a screen reader.
    expect(screen.getByRole('button', {name: '200 g'}).props.accessibilityState)
      .toMatchObject({selected: true});
    expect(screen.getByRole('button', {name: '150 g'}).props.accessibilityState)
      .toMatchObject({selected: false});
  });

  it('recomputes the calories as the portion changes', async () => {
    await render(<PortionEdit guessG={150} />);
    expect(screen.getByText('261')).toBeTruthy();

    await fireEvent.press(screen.getByText('100 g'));
    // 261 kcal at 150 g is 1.74 per gram, so 100 g is 174.
    expect(screen.getByText('174')).toBeTruthy();
  });

  it('hands the corrected number back, not the guess', async () => {
    const onSave = jest.fn();
    await render(<PortionEdit guessG={150} onSave={onSave} />);

    await fireEvent.press(screen.getByLabelText('More'));
    await fireEvent.press(screen.getByText('Save this portion'));

    expect(onSave).toHaveBeenCalledWith(155);
  });

  it('closes from the viewfinder without saving', async () => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    await render(<PortionEdit onClose={onClose} onSave={onSave} />);

    await fireEvent.press(screen.getByLabelText('Close'));

    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
