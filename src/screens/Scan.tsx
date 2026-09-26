import React, {useEffect, useState} from 'react';
import Viewfinder from '../components/Viewfinder';
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
}: {
  mode?: Mode;
  stage?: ScanStage;
  missing?: boolean;
  meal?: string;
  onClose?: () => void;
  onAdd?: () => void;
  onCreateFromLabel?: () => void;
  onWeighPortion?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [stage, setStage] = useState<ScanStage>(initialStage);
  const [chosenMeal, setChosenMeal] = useState(meal);
  const [serving, setServing] = useState(packServings[0]);
  const [column, setColumn] = useState<LabelColumn>('per100');

  /**
   * Aiming is not a resting state — a reader is always reading. The timers are
   * what a sensor will be later, and both paths out of them are designed, so
   * neither stage is one the screen can be stuck in.
   */
  useEffect(() => {
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
  }, [mode, stage, missing]);

  const changeMode = (next: Mode) => {
    setMode(next);
    setStage('aiming');
  };

  const title = mode === 'plate' ? 'Scan a plate' : mode === 'label' ? 'Scan a label' : 'Scan';
  const aiming = stage === 'aiming';

  /* -------------------------------------------------- barcode -------- */
  if (mode === 'barcode') {
    const read = stage !== 'aiming';
    return (
      <Viewfinder
        title={title}
        onClose={onClose}
        onTorch={() => {}}
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
            : undefined
        }
        hintDot={stage === 'looking'}
        mode={aiming ? mode : undefined}
        onMode={aiming ? changeMode : undefined}
        footnote={aiming ? 'No barcode? Switch to Plate' : undefined}
        sheet={
          stage === 'looking' ? (
            <LookingUpSheet barcode={BARCODE} onCancel={onClose} />
          ) : stage === 'nomatch' ? (
            <NoMatchSheet
              barcode={BARCODE}
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
        <BarcodeCard />
      </Viewfinder>
    );
  }

  /* ---------------------------------------------------- plate -------- */
  if (mode === 'plate') {
    return (
      <Viewfinder
        title={title}
        onClose={onClose}
        onTorch={() => {}}
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
        <Plate />
      </Viewfinder>
    );
  }

  /* ---------------------------------------------------- label -------- */
  return (
    <Viewfinder
      title={title}
      onClose={onClose}
      onTorch={() => {}}
      frame={aiming ? FRAMES.label : undefined}
      scrim={aiming ? 0 : 0.62}
      hint={aiming ? 'Fit the whole nutrition table in the frame' : undefined}
      mode={aiming ? mode : undefined}
      onMode={aiming ? changeMode : undefined}
      onShutter={aiming ? () => setStage('result') : undefined}
      sheet={
        stage === 'result' ? (
          <LabelResultSheet
            rows={labelRows}
            servingG={labelServingG}
            column={column}
            onColumn={setColumn}
            onFix={onCreateFromLabel}
            onSave={onCreateFromLabel}
          />
        ) : undefined
      }>
      <NutritionLabel />
    </Viewfinder>
  );
}
