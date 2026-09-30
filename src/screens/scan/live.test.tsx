/**
 * A build with the camera actually working.
 *
 * Every other test file runs without one — the simulator's situation — so this
 * is the only place the live path is exercised at all. It configures the shared
 * camera mock rather than re-mocking the module, because a jest.mock in the
 * setup file takes precedence over one in a test file and re-mocking here would
 * silently do nothing.
 */
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react-native';
const camera = require('react-native-vision-camera');
import Scan from '../Scan';

const latestCamera = () => camera.__cameraProps[camera.__cameraProps.length - 1];

describe('With a working camera', () => {
  beforeEach(() => {
    camera.__resetCamera();
    camera.__setCamera({
      device: {id: 'back-wide'},
      objectOutput: {kind: 'objects'},
      photoOutput: {kind: 'photo', capturePhoto: jest.fn()},
    });
  });

  afterAll(() => camera.__resetCamera());

  it('shows the designed hint, not an explanation of why there is none', async () => {
    await render(<Scan />);

    expect(screen.getByText('No barcode? Switch to Plate')).toBeTruthy();
    expect(screen.queryByText(/showing an example/)).toBeNull();
  });

  it('renders the live picture instead of the drawn stand-in', async () => {
    await render(<Scan />);

    expect(camera.__cameraProps.length).toBeGreaterThan(0);
    expect(screen.queryByTestId('subject-barcode')).toBeNull();
  });

  it('gives the barcode mode its scanner', async () => {
    await render(<Scan />);
    expect(latestCamera().outputs).toEqual([{kind: 'objects'}]);
  });

  it('gives the label mode its shutter, now there is an OCR library again', async () => {
    await render(<Scan mode="label" />);

    expect(latestCamera().outputs[0].kind).toBe('photo');
    expect(screen.queryByTestId('subject-label')).toBeNull();
    expect(screen.queryByText(/No label reader in this build/)).toBeNull();
  });

  it('toggles the torch, which was a dead button before there was a camera', async () => {
    await render(<Scan />);
    expect(latestCamera().torchMode).toBe('off');

    await fireEvent.press(screen.getByLabelText('Torch'));
    expect(latestCamera().torchMode).toBe('on');
  });

  it('waits to be read rather than walking the states on a timer', async () => {
    await render(<Scan />);

    // The stand-in advances itself; a real reader supplies the transition.
    expect(screen.getByText(/Point at the barcode/)).toBeTruthy();
    expect(screen.queryByText('LOOKING UP')).toBeNull();
  });

  it('walks the plate out of Working, which it did not on a real phone', async () => {
    await render(<Scan mode="plate" />);

    await fireEvent.press(screen.getByLabelText('Take the photo'));
    expect(screen.getByText(/Working out what/)).toBeTruthy();

    // The plate timer used to live inside the no-camera branch, so with a real
    // camera nothing ever closed this overlay and Cancel was the only way out.
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.queryByText(/Working out what/)).toBeNull();
  });

  it('does not show a live picture for a plate it cannot read', async () => {
    await render(<Scan mode="plate" />);

    expect(screen.getByTestId('subject-plate')).toBeTruthy();
    expect(screen.getByText(/No plate reader yet/)).toBeTruthy();
  });

  /**
   * The photo that caught the small print and none of the table. Before the
   * floor, this opened the result sheet with one row and 'Save this food'
   * under it — which is how a footnote nearly became a diary entry.
   */
  const shootLabel = async (lines: string[]) => {
    const ocr = require('@react-native-ml-kit/text-recognition');
    ocr.__setOcr({
      blocks: [
        {
          lines: lines.map((text: string, i: number) => ({
            text,
            frame: {left: 0, top: i * 40, width: 300, height: 30},
          })),
        },
      ],
    });
    camera.__setCamera({
      photoOutput: {
        kind: 'photo',
        capturePhoto: jest.fn().mockResolvedValue({
          saveToTemporaryFileAsync: jest.fn().mockResolvedValue('/tmp/label.jpg'),
          dispose: jest.fn(),
        }),
      },
    });
    await render(<Scan mode="label" />);
    await act(async () => {
      await fireEvent.press(screen.getByLabelText('Take the photo'));
    });
  };

  it('stays on the viewfinder when the photo caught only the small print', async () => {
    await shootLabel(['Each slice (30g) contains 75kcal']);

    expect(screen.queryByText('Check these before saving')).toBeNull();
    expect(screen.getByText(/Could not read that panel/)).toBeTruthy();
  });

  it('shows what it did get, so a failure in a kitchen can be diagnosed', async () => {
    await shootLabel(['Each slice (30g) contains 75kcal']);

    // Development builds only, which is what a test runs as.
    expect(screen.getByText('WHAT THE READER GOT')).toBeTruthy();
    expect(screen.getByText(/rows after grouping: 1/)).toBeTruthy();
    expect(screen.getByText(/Each slice \(30g\) contains 75kcal/)).toBeTruthy();
  });

  it('copies the whole dump, because it is too long to select by hand', async () => {
    const {Clipboard} = require('react-native');
    const setString = jest.spyOn(Clipboard, 'setString').mockImplementation(() => {});

    await shootLabel(['Each slice (30g) contains 75kcal']);
    await fireEvent.press(screen.getByLabelText('Copy the read'));

    expect(setString).toHaveBeenCalledTimes(1);
    const dump = setString.mock.calls[0][0];
    // The rows and the parse, which is the whole point of copying it.
    expect(dump).toContain('Each slice (30g) contains 75kcal');
    expect(dump).toContain('per100:');
    expect(dump).toContain('unread:');
    expect(screen.getByText('Copied')).toBeTruthy();
    setString.mockRestore();
  });

  it('opens the sheet when the photo caught the table', async () => {
    await shootLabel([
      'Typical values per 100g per 30g',
      'Energy 1728kJ / 416kcal 518kJ / 125kcal',
      'Fat 34.9g 10.5g',
      'Protein 25.4g 7.6g',
    ]);

    expect(screen.getByText('READ FROM THE LABEL')).toBeTruthy();
    expect(screen.queryByText(/Could not read that panel/)).toBeNull();
  });
});