import React, {useCallback, useEffect, useState} from 'react';
import Viewfinder from '../components/Viewfinder';
import Preview from '../components/Preview';
import CameraRefused from './scan/CameraRefused';
import {
  useBarcodeReader,
  useCameraState,
  useLabelReader,
} from '../readers/useReaders';
import type {LabelRead, ScannedBarcode} from '../readers';
import {toLabelRows} from '../readers/label';
import {BarcodeCard, NutritionLabel, Plate} from '../components/subjects';
import {
  FoundSheet,
  LabelResultSheet,
  LookingUpSheet,
  NoMatchSheet,
  PlateResultSheet,
  ServingSheet,
} from './scan/sheets';
import type {LabelColumn} from './scan/sheets';
import {
  BARCODE,
  labelRows,
  labelServingG,
  matchedProduct,
  packServings,
  platedItems,
} from '../fixtures/scan';
import type {Frame, Mode} from '../components/Viewfinder';

/**
 * The three ways to scan, on one screen, because they are one gesture with the
 * phone held the same way — the mode tabs swap what is being read, not where
 * you are.
 *
 * Each mode is a small state machine, and every state is designed:
 *
 *   barcode  aiming → looking → found → serving   (or nomatch)
 *   plate    aiming → working → result
 *   label    aiming → result
 *
 * Switching mode always returns to aiming: a barcode result means nothing once
 * the phone is pointed at a plate.
 */
export type ScanStage =
  | 'aiming'
  | 'looking'
  | 'found'
  | 'serving'
  | 'nomatch'
  | 'working'
  | 'result';

/** How long the fake reader takes. Real reads are not instant either. */
const LOOKUP_MS = 1400;
const ANALYSE_MS = 2200;

const FRAMES: Record<string, Frame> = {
  barcodeAiming: {width: 298, height: 200, top: 186},
  barcodeRead: {width: 278, height: 176, top: 196},
  plate: {width: 310, height: 300, top: 214},
  label: {width: 286, height: 326, top: 196},
};

export default function Scan({
  mode: initialMode = 'barcode',
  stage: initialStage = 'aiming',
  /** True when the barcode will not be found — the unhappy path, on demand. */
  missing = false,
  meal = 'Lunch',
  onClose,
  onAdd,
  onCreateFromLabel,
  onWeighPortion,
  onTypeItIn,
}: {
  mode?: Mode;
  stage?: ScanStage;
  missing?: boolean;
  meal?: string;
  onClose?: () => void;
  onAdd?: () => void;
  onCreateFromLabel?: () => void;
  onWeighPortion?: () => void;
  onTypeItIn?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [stage, setStage] = useState<ScanStage>(initialStage);
  const [chosenMeal, setChosenMeal] = useState(meal);
  const [serving, setServing] = useState(packServings[0]);
  const [column, setColumn] = useState<LabelColumn>('per100');
  const [torch, setTorch] = useState(false);

  /**
   * What the camera can do here. 'unavailable' is the simulator, and it is not
   * an error — the drawn stand-in takes over and every state stays reachable.
   */
  const camera = useCameraState();
  const live = camera === 'ready';

  /** What was actually read, kept so a poor read can show its working. */
  const [scanned, setScanned] = useState<ScannedBarcode | undefined>();
  const [labelRead, setLabelRead] = useState<LabelRead | undefined>();

  const onBarcode = useCallback((code: ScannedBarcode) => {
    setScanned(code);
    setStage('looking');
  }, []);

  // Hooks, so they run in every mode; only one is fed frames at a time.
  const barcodeOutput = useBarcodeReader(onBarcode, live && mode === 'barcode');
  const labelReader = useLabelReader();

  /**
   * Aiming is not a resting state — a reader is always reading. The timers are
   * what a sensor will be later, and both paths out of them are designed, so
   * neither stage is one the screen can be stuck in.
   */
  useEffect(() => {
    // With a real camera the reader supplies these transitions itself; the
    // timers are the stand-in's way of walking the same states.
    if (live) {
      if (mode === 'barcode' && stage === 'looking') {
        const t = setTimeout(() => setStage(missing ? 'nomatch' : 'found'), LOOKUP_MS);
        return () => clearTimeout(t);
      }
      return undefined;
    }
    if (mode === 'barcode' && stage === 'aiming') {
      const t = setTimeout(() => setStage('looking'), LOOKUP_MS);
      return () => clearTimeout(t);
    }
    if (mode === 'barcode' && stage === 'looking') {
      const t = setTimeout(() => setStage(missing ? 'nomatch' : 'found'), LOOKUP_MS);
      return () => clearTimeout(t);
    }
    if (mode === 'plate' && stage === 'working') {
      const t = setTimeout(() => setStage('result'), ANALYSE_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [mode, stage, missing, live]);

  const changeMode = (next: Mode) => {
    setMode(next);
    setStage('aiming');
  };

  const title = mode === 'plate' ? 'Scan a plate' : mode === 'label' ? 'Scan a label' : 'Scan';
  const aiming = stage === 'aiming';

  /**
   * Refused, and there is nothing to aim. Shown over the dark ground so it
   * reads as part of the scanner rather than an error page. There is no board
   * for this — a camera can always be said no to and the design does not cover
   * it — so it is built on the same sheet as every other outcome.
   */
  if (camera === 'no-permission' || camera === 'refused') {
    return (
      <Viewfinder
        title={title}
        onClose={onClose}
        scrim={0.62}
        sheet={
          <CameraRefused
            canAsk={camera === 'no-permission'}
            onTypeItIn={onTypeItIn}
            onClose={onClose}
          />
        }
      />
    );
  }

  /* -------------------------------------------------- barcode -------- */
  if (mode === 'barcode') {
    const read = stage !== 'aiming';
    return (
      <Viewfinder
        title={title}
        onClose={onClose}
        onTorch={() => setTorch(on => !on)}
        frame={
          stage === 'found' || stage === 'serving'
            ? undefined
            : read
            ? FRAMES.barcodeRead
            : FRAMES.barcodeAiming
        }
        frameState={stage === 'nomatch' ? 'failed' : read ? 'read' : 'aiming'}
        scrim={aiming ? 0 : stage === 'found' ? 0 : 0.55}
        hint={
          aiming
            ? 'Point at the barcode — it reads on its own'
            : stage === 'looking'
            ? 'Barcode read'
            : stage === 'found'
            ? 'Matched in Open Food Facts'
            : undefined
        }
        hintDot={stage === 'looking' || stage === 'found'}
        mode={aiming ? mode : undefined}
        onMode={aiming ? changeMode : undefined}
        footnote={aiming ? 'No barcode? Switch to Plate' : undefined}
        sheet={
          stage === 'looking' ? (
            <LookingUpSheet barcode={scanned?.value ?? BARCODE} onCancel={onClose} />
          ) : stage === 'nomatch' ? (
            <NoMatchSheet
              barcode={scanned?.value ?? BARCODE}
              onFromLabel={() => changeMode('label')}
              onRetry={() => setStage('aiming')}
            />
          ) : stage === 'serving' ? (
            <ServingSheet
              product={matchedProduct}
              servings={packServings}
              chosen={serving}
              onChoose={setServing}
              onWeigh={onWeighPortion}
              onUse={() => setStage('found')}
            />
          ) : stage === 'found' ? (
            <FoundSheet
              product={matchedProduct}
              serving={serving}
              meal={chosenMeal}
              onMeal={setChosenMeal}
              onServing={() => setStage('serving')}
              onAdd={onAdd}
            />
          ) : undefined
        }>
        {live ? <Preview outputs={[barcodeOutput]} torch={torch} /> : <BarcodeCard />}
      </Viewfinder>
    );
  }

  /* ---------------------------------------------------- plate -------- */
  if (mode === 'plate') {
    return (
      <Viewfinder
        title={title}
        onClose={onClose}
        onTorch={() => setTorch(on => !on)}
        frame={aiming ? FRAMES.plate : undefined}
        scrim={aiming ? 0 : stage === 'working' ? 0.62 : 0.5}
        hint={aiming ? 'Fit the whole plate in frame, from above' : undefined}
        mode={aiming ? mode : undefined}
        onMode={aiming ? changeMode : undefined}
        onShutter={aiming ? () => setStage('working') : undefined}
        working={
          stage === 'working'
            ? {
                title: 'Working out what’s on the plate',
                body: 'A few seconds. You will get a list you can correct — not a final answer.',
                onCancel: () => setStage('aiming'),
              }
            : undefined
        }
        sheet={
          stage === 'result' ? (
            <PlateResultSheet
              items={platedItems}
              meal={chosenMeal}
              onCorrect={onWeighPortion}
              onAddMissing={onCreateFromLabel}
              onAdd={onAdd}
            />
          ) : undefined
        }>
        {live ? (
          <Preview outputs={[labelReader.photoOutput]} torch={torch} />
        ) : (
          <Plate />
        )}
      </Viewfinder>
    );
  }

  /* ---------------------------------------------------- label -------- */
  return (
    <Viewfinder
      title={title}
      onClose={onClose}
      onTorch={() => setTorch(on => !on)}
      frame={aiming ? FRAMES.label : undefined}
      scrim={aiming ? 0 : 0.62}
      hint={aiming ? 'Fit the whole nutrition table in the frame' : undefined}
      mode={aiming ? mode : undefined}
      onMode={aiming ? changeMode : undefined}
      onShutter={
        aiming
          ? () => {
              if (!live) {
                setStage('result');
                return;
              }
              setStage('working');
              labelReader
                .capture()
                .then(read => {
                  setLabelRead(read);
                  setStage('result');
                })
                // A failed read returns to aiming rather than to nothing.
                .catch(() => setStage('aiming'));
            }
          : undefined
      }
      sheet={
        stage === 'result' ? (
          <LabelResultSheet
            rows={labelRead ? toLabelRows(labelRead) : labelRows}
            servingG={labelRead?.reading.servingG ?? labelServingG}
            unread={labelRead?.reading.unread}
            column={column}
            onColumn={setColumn}
            onFix={onCreateFromLabel}
            onSave={onCreateFromLabel}
          />
        ) : undefined
      }>
      {live ? (
        <Preview outputs={[labelReader.photoOutput]} torch={torch} />
      ) : (
        <NutritionLabel />
      )}
    </Viewfinder>
  );
}
