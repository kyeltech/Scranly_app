import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import FoodDetail from './FoodDetail';
import {food} from '../domain/food';

const almonds = food({
  id: 'off-4088600441689',
  name: 'Almonds',
  brand: 'The Foodie Market',
  portion: '100 g',
  kcal: 597,
  proteinG: 21.2,
  carbsG: 9.1,
  fatG: 49.9,
  fibreG: 12.5,
  yours: true,
});

describe('the food detail screen', () => {
  it('shows the food, its energy and every macro including fibre', async () => {
    await render(<FoodDetail food={almonds} meal="Snack" />);

    expect(screen.getByText('Almonds')).toBeTruthy();
    expect(screen.getByText('The Foodie Market · 100 g')).toBeTruthy();
    expect(screen.getByText('597')).toBeTruthy();
    expect(screen.getByText('21.2')).toBeTruthy(); // protein
    expect(screen.getByText('9.1')).toBeTruthy(); // carbs
    expect(screen.getByText('49.9')).toBeTruthy(); // fat
    expect(screen.getByText('12.5')).toBeTruthy(); // fibre
  });

  it('shows a dash for fibre when the food has none recorded', async () => {
    const noFibre = food({
      id: 'x',
      name: 'Mystery',
      portion: '1 serving',
      kcal: 100,
      proteinG: 1,
      carbsG: 2,
      fatG: 3,
    });

    await render(<FoodDetail food={noFibre} meal="Lunch" />);

    expect(screen.getByText('—')).toBeTruthy();
  });

  it('logs the food to the meal, which can be switched first', async () => {
    const onLog = jest.fn();
    await render(<FoodDetail food={almonds} meal="Snack" onLog={onLog} />);

    // Opens on the meal it came from.
    expect(screen.getByText('Add to snack')).toBeTruthy();

    await fireEvent.press(screen.getByText('Dinner'));
    await fireEvent.press(screen.getByText('Add to dinner'));

    expect(onLog).toHaveBeenCalledWith(almonds, 'Dinner');
  });
});
