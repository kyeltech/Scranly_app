import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import AddFood from './AddFood';
import CreateFood from './CreateFood';

describe('Add food', () => {
  it('opens on what you actually eat, not on an empty search', async () => {
    await render(<AddFood />);

    expect(screen.getByText('EATEN THIS WEEK')).toBeTruthy();
    expect(screen.getByText('Porridge oats')).toBeTruthy();
    expect(screen.getByText('Create a food')).toBeTruthy();
  });

  it('replaces the list with results as soon as you type', async () => {
    await render(<AddFood />);

    await fireEvent.changeText(
      screen.getByLabelText('Search foods and brands'),
      'chicken',
    );

    expect(screen.getByText('6 RESULTS')).toBeTruthy();
    expect(screen.getByText('Chicken breast, grilled')).toBeTruthy();
    // Your own foods rank above the database.
    expect(screen.getAllByText('YOURS').length).toBeGreaterThan(0);
    expect(screen.queryByText('EATEN THIS WEEK')).toBeNull();
  });

  it('says so plainly when nothing matches, rather than showing an empty list', async () => {
    await render(<AddFood />);

    await fireEvent.changeText(
      screen.getByLabelText('Search foods and brands'),
      'quinoa',
    );

    expect(screen.getByText(/Nothing matches/)).toBeTruthy();
  });

  it('counts what you pick, and hands the lot back at once', async () => {
    const onAdd = jest.fn();
    await render(<AddFood onAdd={onAdd} />);

    await fireEvent.press(screen.getByText('Porridge oats'));
    expect(screen.getByText('Add 1 item')).toBeTruthy();

    await fireEvent.press(screen.getByText('Semi-skimmed milk'));
    expect(screen.getByText('Add 2 items')).toBeTruthy();
    expect(screen.getByText('250 kcal')).toBeTruthy();

    await fireEvent.press(screen.getByText('Add 2 items'));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd.mock.calls[0][0].map((f: {id: string}) => f.id)).toEqual([
      'oats',
      'milk',
    ]);
  });

  it('lets you change your mind about an item', async () => {
    await render(<AddFood />);

    await fireEvent.press(screen.getByText('Porridge oats'));
    await fireEvent.press(screen.getByText('Porridge oats'));

    expect(screen.queryByText('Add 1 item')).toBeNull();
  });
});

describe('Create a food', () => {
  it('offers the label scanner before asking anyone to type seven numbers', async () => {
    await render(<CreateFood />);

    expect(screen.getByText('Scan the label instead')).toBeTruthy();
    expect(screen.getByText(/Only a name and the calories are required/)).toBeTruthy();
  });
});
