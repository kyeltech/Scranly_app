import React from 'react';
import {act} from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import Scan from './Scan';
import ScalePhoto from './ScalePhoto';
import PortionEdit from './PortionEdit';

/** The reader's own delay, which the screen fakes with a timer. */
const settle = async (ms = 3000) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

describe('Scan — the three readers', () => {
  it('offers all three modes while aiming, and says what to point at', async () => {
    await render(<Scan />);

    expect(screen.getByText('Barcode')).toBeTruthy();
    expect(screen.getByText('Plate')).toBeTruthy();
    expect(screen.getByText('Label')).toBeTruthy();
    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
    // Jest has no camera, as the simulator has none, so the footnote says why
    // rather than showing the designed hint. See live.test.tsx for that.
    expect(screen.getByText(/showing an example/)).toBeTruthy();
  });

  it('switching mode starts that reader aiming, not showing the last result', async () => {
    await render(<Scan stage="found" />);
    expect(screen.getByText('Mature Cheddar')).toBeTruthy();

    // Found hides the tabs, so come back to aiming first.
    await render(<Scan />);
    await fireEvent.press(screen.getByText('Plate'));

    expect(screen.getByText(/Fit the whole plate in frame/)).toBeTruthy();
    expect(screen.queryByText('Mature Cheddar')).toBeNull();
  });
});

describe('Scan — barcode', () => {
  it('reads, looks up, and lands on the product', async () => {
    await render(<Scan />);
    expect(screen.getByTestId('frame-aiming')).toBeTruthy();

    // Read, then looked up: two waits, because they are two different failures.
    await settle();
    await settle();

    expect(screen.getByText('Mature Cheddar')).toBeTruthy();
    expect(screen.getByText('Cathedral City · 5012345678900')).toBeTruthy();
    expect(screen.getByText('Add to lunch')).toBeTruthy();
  });

  it('shows the barcode it is waiting on rather than a bare spinner', async () => {
    await render(<Scan stage="looking" />);

    expect(screen.getByText('LOOKING UP')).toBeTruthy();
    expect(screen.getByText('5012345678900')).toBeTruthy();
    // Read, so the frame has gone lime.
    expect(screen.getByTestId('frame-read')).toBeTruthy();
  });

  it('admits a barcode it cannot find, and offers the label instead', async () => {
    await render(<Scan stage="looking" missing />);
    await settle();

    expect(screen.getByText('Not in the database')).toBeTruthy();
    expect(screen.getByTestId('frame-failed')).toBeTruthy();
    expect(screen.getByText('Add it from the label')).toBeTruthy();

    await fireEvent.press(screen.getByText('Add it from the label'));
    expect(screen.getByText(/Fit the whole nutrition table/)).toBeTruthy();
  });

  it('changes the calories with the serving, and the button with them', async () => {
    await render(<Scan stage="found" />);
    expect(screen.getByText('125')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Change the serving'));
    expect(screen.getByText('How much?')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Whole pack'));
    expect(screen.getByText('Use Whole pack')).toBeTruthy();

    await fireEvent.press(screen.getByText('Use Whole pack'));
    expect(screen.getByText('1,040')).toBeTruthy();
    expect(screen.getByText('250 g · Whole pack')).toBeTruthy();
  });

  it('offers scales when the pack’s servings do not fit what is on the plate', async () => {
    const onWeigh = jest.fn();
    await render(<Scan stage="serving" onWeighPortion={onWeigh} />);

    await fireEvent.press(screen.getByText('Weigh it — enter grams'));
    expect(onWeigh).toHaveBeenCalled();
  });
});

describe('Scan — plate', () => {
  it('says what it is doing and how sure it will be, while it works', async () => {
    await render(<Scan mode="plate" />);
    await fireEvent.press(screen.getByLabelText('Take the photo'));

    expect(screen.getByText(/Working out what’s on the plate/)).toBeTruthy();
    expect(screen.getByText(/not a final answer/)).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('lists what it saw, hedges every portion, and flags the shakiest', async () => {
    await render(<Scan mode="plate" stage="result" />);

    expect(screen.getByText('Four things on the plate')).toBeTruthy();
    expect(screen.getByText('about 150 g')).toBeTruthy();
    expect(screen.getByText(/A photo cannot see weight/)).toBeTruthy();
    // Oil is invisible in a photo, and the sheet admits which line it trusts least.
    expect(screen.getByText('NOT SURE')).toBeTruthy();
    expect(screen.getByText('Add 4 items to lunch')).toBeTruthy();
    expect(screen.getByText('Something it missed')).toBeTruthy();
  });

  it('can be corrected — the portion is the control, not a label', async () => {
    const onCorrect = jest.fn();
    await render(<Scan mode="plate" stage="result" onWeighPortion={onCorrect} />);

    await fireEvent.press(screen.getByText('about 1 tbsp'));
    expect(onCorrect).toHaveBeenCalled();
  });
});

describe('Scan — label', () => {
  it('asks which of a UK label’s two columns to keep', async () => {
    await render(<Scan mode="label" stage="result" />);

    expect(screen.getByText('READ FROM THE LABEL')).toBeTruthy();
    expect(screen.getByText('Per 100 g')).toBeTruthy();
    expect(screen.getByText('Per serving (30 g)')).toBeTruthy();
    expect(screen.getByText('416 kcal')).toBeTruthy();
  });

  it('swaps every figure when the other column is picked', async () => {
    await render(<Scan mode="label" stage="result" />);

    await fireEvent.press(screen.getByText('Per serving (30 g)'));

    expect(screen.getByText('125 kcal')).toBeTruthy();
    expect(screen.queryByText('416 kcal')).toBeNull();
    expect(screen.getByText('10.4 g')).toBeTruthy();
  });
});

describe('Photograph the scale', () => {
  it('aims, then shows what it read as a correctable number', async () => {
    await render(<ScalePhoto reading={79.6} yesterdayKg={79.5} averageKg={79.8} />);

    expect(screen.getByText(/Hold the phone flat/)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Take the photo'));

    expect(screen.getByText('READ FROM THE DISPLAY')).toBeTruthy();
    // The number is a control, not a caption: it is how you fix a misread.
    expect(screen.getByLabelText('Fix the reading')).toBeTruthy();
    expect(screen.getByText(/photographed at an angle/)).toBeTruthy();
    expect(screen.getByText('Save 79.6 kg')).toBeTruthy();
  });

  it('can be taken again rather than only accepted or abandoned', async () => {
    await render(
      <ScalePhoto reading={79.6} yesterdayKg={79.5} averageKg={79.8} stage="read" />,
    );

    await fireEvent.press(screen.getByText('Take it again'));
    expect(screen.getByText(/Hold the phone flat/)).toBeTruthy();
  });

  it('falls back to typing when the read is wrong', async () => {
    const onFix = jest.fn();
    await render(
      <ScalePhoto
        reading={79.6}
        yesterdayKg={79.5}
        averageKg={79.8}
        stage="read"
        onFix={onFix}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Fix the reading'));
    expect(onFix).toHaveBeenCalled();
  });
});

describe('Correcting a portion', () => {
  it('opens on the guess and hands back what was set instead', async () => {
    const onSave = jest.fn();
    await render(
      <PortionEdit name="Chicken thigh, grilled" guessG={150} onSave={onSave} />,
    );

    expect(screen.getByText('The photo guessed 150 g')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('More'));
    await fireEvent.press(screen.getByText('Save this portion'));

    expect(onSave).toHaveBeenCalledWith(155);
  });
});
