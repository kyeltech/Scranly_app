import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import ScanResult from './ScanResult';
import PortionEdit from './PortionEdit';

describe('Scan result', () => {
  it('shows the barcode and a shape for the wait, not a bare spinner', async () => {
    await render(<ScanResult state="looking" />);

    expect(screen.getByText('LOOKING UP')).toBeTruthy();
    expect(screen.getByText('5012345678900')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('fills the sheet in place once the product resolves', async () => {
    await render(<ScanResult state="found" />);

    expect(screen.getByText('Mature Cheddar')).toBeTruthy();
    expect(screen.getByText('125')).toBeTruthy();
    expect(screen.getByLabelText('Change the serving')).toBeTruthy();
    expect(screen.getByText('Add to lunch')).toBeTruthy();
  });

  it('follows the meal you pick', async () => {
    await render(<ScanResult state="found" />);

    await fireEvent.press(screen.getByText('Dinner'));

    expect(screen.getByText('Add to dinner')).toBeTruthy();
  });

  it('treats a miss as a path to fix it, not an error', async () => {
    await render(<ScanResult state="nomatch" />);

    expect(screen.getByText('Not in the database')).toBeTruthy();
    expect(screen.getByText(/most UK branded food, but not all of it/)).toBeTruthy();
    expect(screen.getByText('Add it from the label')).toBeTruthy();
  });
});

describe('Portion editor', () => {
  it('calls the photo’s number a guess, and offers something to guess against', async () => {
    await render(<PortionEdit />);

    expect(screen.getByText('The photo guessed 150 g')).toBeTruthy();
    expect(screen.getByText(/Your palm, thickness included/)).toBeTruthy();
  });

  it('recalculates the calories live as the portion moves', async () => {
    await render(<PortionEdit />);
    expect(screen.getByText('261')).toBeTruthy();

    await fireEvent.press(screen.getByText('200 g'));

    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('348')).toBeTruthy();
  });

  it('hands back the corrected portion', async () => {
    const onSave = jest.fn();
    await render(<PortionEdit onSave={onSave} />);

    await fireEvent.press(screen.getByLabelText('More'));
    await fireEvent.press(screen.getByText('Save this portion'));

    expect(onSave).toHaveBeenCalledWith(155);
  });
});
