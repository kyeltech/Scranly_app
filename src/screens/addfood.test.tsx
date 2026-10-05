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

  it('lets every field be typed into, and hands back what was typed', async () => {
    const onSave = jest.fn();
    await render(<CreateFood onSave={onSave} />);

    await fireEvent.changeText(screen.getByLabelText('NAME'), 'Mum’s jollof rice');
    await fireEvent.changeText(screen.getByLabelText('BRAND'), 'Homemade');
    await fireEvent.changeText(screen.getByLabelText('SERVING'), '250');
    await fireEvent.changeText(screen.getByLabelText('CALORIES'), '418');
    await fireEvent.changeText(screen.getByLabelText('PROTEIN'), '9.4');
    await fireEvent.changeText(screen.getByLabelText('CARBS'), '76.0');
    await fireEvent.changeText(screen.getByLabelText('FAT'), '8.2');
    await fireEvent.press(screen.getByText('Save food'));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Mum’s jollof rice',
      brand: 'Homemade',
      servingG: '250',
      kcal: '418',
      proteinG: '9.4',
      carbsG: '76.0',
      fatG: '8.2',
    });
  });

  it('saves with the macros left blank, because the note promises that', async () => {
    const onSave = jest.fn();
    await render(<CreateFood onSave={onSave} />);

    await fireEvent.changeText(screen.getByLabelText('NAME'), 'Leftovers');
    await fireEvent.changeText(screen.getByLabelText('CALORIES'), '300');
    await fireEvent.press(screen.getByText('Save food'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({name: 'Leftovers', kcal: '300', proteinG: ''}),
    );
  });
});

describe('The filter chips on Add food', () => {
  it('starts on Recent and swaps the list when another is picked', async () => {
    await render(<AddFood />);

    expect(screen.getByText('EATEN THIS WEEK')).toBeTruthy();

    await fireEvent.press(screen.getByText('Frequent'));
    expect(screen.getByText('MOST LOGGED')).toBeTruthy();

    await fireEvent.press(screen.getByText('My foods'));
    expect(screen.getByText('FOODS YOU MADE')).toBeTruthy();
    expect(screen.getByText('Mum’s jollof rice')).toBeTruthy();
  });

  it('sorts Frequent by how often a food is logged, which is the point of it', async () => {
    await render(<AddFood />);
    await fireEvent.press(screen.getByText('Frequent'));

    const names = screen.getAllByRole('button').map(b => b.props.accessibilityState);
    expect(names.length).toBeGreaterThan(0);
    // Porridge oats is his most-logged food, so it heads the list.
    const rows = screen.getAllByText(/Porridge oats|Peanut butter, smooth/);
    expect(rows[0].props.children).toBe('Porridge oats');
  });

  it('says why an empty chip is empty rather than showing a blank list', async () => {
    await render(<AddFood />);

    await fireEvent.press(screen.getByText('Meals'));
    expect(screen.getByText('SAVED MEALS')).toBeTruthy();
    expect(screen.getByText(/No saved meals yet/)).toBeTruthy();
  });

  it('keeps the chips out of the way while searching', async () => {
    await render(<AddFood />);
    await fireEvent.changeText(
      screen.getByLabelText('Search foods and brands'),
      'chicken',
    );

    expect(screen.queryByText('Frequent')).toBeNull();
    expect(screen.getByText(/RESULTS$/)).toBeTruthy();
  });
});
