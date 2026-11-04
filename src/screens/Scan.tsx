import React, {useCallback, useEffect, useState} from 'react';
import Viewfinder from '../components/Viewfinder';
import Preview from '../components/Preview';
import CameraRefused from './scan/CameraRefused';
import ReadDebug from './scan/ReadDebug';
import {
  hasLabelReader,
  outputsOf,
  useBarcodeReader,
  useCameraState,
  useLabelReader,
} from '../readers/useReaders';
import {CAMERA_NOTICE} from '../readers';
import type {LabelRead, ScannedBarcode} from '../readers';
import type {LabelReading} from '../readers/label';
import {isUsable, toLabelRows} from '../readers/label';
import {fromProduct, lookupBarcode, servingsFor} from '../readers/product';
import type {LookupResult, Product} from '../readers/product';
import type {FoodItem} from '../domain/food';
import type {MealName} from '../domain/day';
import {BarcodeCard, NutritionLabel, Plate} from '../components/subjects';
import {
  CantReachSheet,
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
  labelReading,
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
  /** Could not reach Open Food Facts — a failure to ask, not a miss (ADR-0006). */
  | 'error'
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
  /** How a barcode becomes a product. Injected so a test need not touch the network. */
  lookup = lookupBarcode,
  onClose,
  onAdd,
  onLog,
  onCreateFromLabel,
  onWeighPortion,
  onTypeItIn,
}: {
  mode?: Mode;
  stage?: ScanStage;
  missing?: boolean;
  meal?: string;
  lookup?: (barcode: string) => Promise<LookupResult>;
  onClose?: () => void;
  onAdd?: () => void;
  /** Log a scanned product at the chosen serving, to the chosen meal. */
  onLog?: (item: FoodItem, meal: MealName) => void;
  /** The reading comes with it: the label was read, so the form can be filled. */
  onCreateFromLabel?: (reading?: LabelReading) => void;
  onWeighPortion?: () => void;
  onTypeItIn?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [stage, setStage] = useState<ScanStage>(initialStage);
  const [chosenMeal, setChosenMeal] = useState(meal);
  const [serving, setServing] = useState(packServings[0]);
  const [column, setColumn] = useState<LabelColumn>('per100');
  const [torch, setTorch] = useState(false);
  /** The product a live lookup found. Undefined on the drawn stand-in, which shows the fixture. */
  const [product, setProduct] = useState<Product | undefined>();

  /**
   * What the camera can do here. 'unavailable' is the simulator, and it is not
   * an error — the drawn stand-in takes over and every state stays reachable.
   */
  const camera = useCameraState();
  const live = camera === 'ready';
  /** The label mode needs an OCR library as well as a camera. */
  const liveLabel = live && hasLabelReader;
  /**
   * Why there is no picture, when there is none. Four different causes produced
   * the same drawn stand-in, with no way to tell them apart from the outside —
   * so the screen says which. True of a user's iPad with no camera as much as of
   * a build that skipped a pod install.
   */
  const notice = CAMERA_NOTICE[camera];
  const labelNotice =
    notice ?? (hasLabelReader ? undefined : 'No label reader in this build — showing an example');
  /**
   * There is no plate reader in any build yet, so the plate mode never shows a
   * live picture: a preview that reads nothing is a promise the app cannot
   * keep. The drawn plate and the footnote say what is actually happening.
   */
  const plateNotice = notice ?? 'No plate reader yet — showing an example';

  /** What was actually read, kept so a poor read can show its working. */
  const [scanned, setScanned] = useState<ScannedBarcode | undefined>();
  const [labelRead, setLabelRead] = useState<LabelRead | undefined>();
  /**
   * The last shutter press did not produce a panel. Said on the viewfinder
   * rather than in a sheet, because the answer is to take another photo.
   */
  const [poorRead, setPoorRead] = useState(false);
  /**
   * The last read, good or bad, and why it failed if it did. Only ever shown in
   * a development build — see ReadDebug.
   */
  const [lastRead, setLastRead] = useState<LabelRead | undefined>();
  const [captureError, setCaptureError] = useState<string | undefined>();

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
    // Aiming is where a reader takes over: with a real camera the barcode
    // scanner reports the code itself, so only the stand-in needs walking out
    // of it.
    if (mode === 'barcode' && stage === 'aiming' && !live) {
      const t = setTimeout(() => setStage('looking'), LOOKUP_MS);
      return () => clearTimeout(t);
    }
    // Looking up. A real scan has set `scanned`, so the barcode goes to Open
    // Food Facts (ADR-0010); found shows the product, a miss is 'nomatch', and
    // a failure to reach it is 'error', which is not the same thing (ADR-0006).
    // The drawn stand-in has no code to send, so it still walks the designed
    // outcome on a timer.
    if (mode === 'barcode' && stage === 'looking') {
      if (live && scanned) {
        let cancelled = false;
        lookup(scanned.value).then(result => {
          if (cancelled) {
            return;
          }
          if (result.status === 'found') {
            setProduct(result.product);
            setServing(servingsFor(result.product)[0]);
            setStage('found');
          } else {
            setStage(result.status === 'not-found' ? 'nomatch' : 'error');
          }
        });
        return () => {
          cancelled = true;
        };
      }
      const t = setTimeout(() => setStage(missing ? 'nomatch' : 'found'), LOOKUP_MS);
      return () => clearTimeout(t);
    }
    /**
     * And so is the plate, in both builds, because there is no plate reader in
     * either — ADR-0004 is still open on it. This used to sit inside the branch
     * that only ran without a camera, so on a real phone the shutter opened the
     * 'Working out what's on the plate' overlay and nothing ever closed it.
     * Nothing caught it, because every test ran on the simulator's no-camera
     * path where the timer did run.
     */
    if (mode === 'plate' && stage === 'working') {
      const t = setTimeout(() => setStage('result'), ANALYSE_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [mode, stage, missing, live, scanned, lookup]);

  const changeMode = (next: Mode) => {
    setMode(next);
    setStage('aiming');
    setPoorRead(false);
  };

  const title = mode === 'plate' ? 'Scan a plate' : mode === 'label' ? 'Scan a label' : 'Scan';
  const aiming = stage === 'aiming';

  /**
   * A live lookup's product and its servings, or the fixture on the drawn
   * stand-in — which has no camera to scan with, so it walks the board.
   */
  const shownProduct = product ?? matchedProduct;
  const servings = product ? servingsFor(product) : packServings;

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
        torch={torch}
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
        frameState={
          stage === 'nomatch' || stage === 'error' ? 'failed' : read ? 'read' : 'aiming'
        }
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
        footnote={aiming ? notice ?? 'No barcode? Switch to Plate' : undefined}
        sheet={
          stage === 'looking' ? (
            <LookingUpSheet barcode={scanned?.value ?? BARCODE} onCancel={onClose} />
          ) : stage === 'nomatch' ? (
            <NoMatchSheet
              barcode={scanned?.value ?? BARCODE}
              onFromLabel={() => changeMode('label')}
              onRetry={() => setStage('aiming')}
            />
          ) : stage === 'error' ? (
            <CantReachSheet
              barcode={scanned?.value ?? BARCODE}
              onRetry={() => setStage('aiming')}
              onTypeItIn={onTypeItIn}
            />
          ) : stage === 'serving' ? (
            <ServingSheet
              product={shownProduct}
              servings={servings}
              chosen={serving}
              onChoose={setServing}
              onWeigh={onWeighPortion}
              onUse={() => setStage('found')}
            />
          ) : stage === 'found' ? (
            <FoundSheet
              product={shownProduct}
              serving={serving}
              meal={chosenMeal}
              onMeal={setChosenMeal}
              onServing={() => setStage('serving')}
              onAdd={() =>
                onLog?.(fromProduct(shownProduct, serving), chosenMeal as MealName)
              }
            />
          ) : undefined
        }>
        {live ? <Preview outputs={outputsOf(barcodeOutput)} torch={torch} /> : <BarcodeCard />}
      </Viewfinder>
    );
  }

  /* ---------------------------------------------------- plate -------- */
  if (mode === 'plate') {
    return (
      <Viewfinder
       torch={torch}
        title={title}
        onClose={onClose}
        onTorch={() => setTorch(on => !on)}
        frame={aiming ? FRAMES.plate : undefined}
        scrim={aiming ? 0 : stage === 'working' ? 0.62 : 0.5}
        hint={aiming ? 'Fit the whole plate in frame, from above' : undefined}
        mode={aiming ? mode : undefined}
        onMode={aiming ? changeMode : undefined}
        footnote={aiming ? plateNotice : undefined}
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
              onAddMissing={() => onCreateFromLabel?.()}
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
      torch={torch}
      title={title}
      onClose={onClose}
      onTorch={() => setTorch(on => !on)}
      frame={aiming ? FRAMES.label : undefined}
      scrim={aiming ? 0 : 0.62}
      hint={
        aiming
          ? poorRead
            ? 'Could not read that panel. Fill the frame with the table and tap to focus.'
            : 'Fit the whole nutrition table in the frame'
          : undefined
      }
      mode={aiming ? mode : undefined}
      onMode={aiming ? changeMode : undefined}
      footnote={aiming ? labelNotice : undefined}
      onShutter={
        aiming
          ? () => {
              if (!liveLabel) {
                setStage('result');
                return;
              }
              setPoorRead(false);
              setCaptureError(undefined);
              setStage('working');
              labelReader
                .capture()
                .then(read => {
                  setLastRead(read);
                  // A fragment is a failed read, not a thin answer: showing one
                  // row under 'Check these before saving' invites saving it.
                  if (!isUsable(read.reading)) {
                    setPoorRead(true);
                    setStage('aiming');
                    return;
                  }
                  setLabelRead(read);
                  setStage('result');
                })
                // A failed read returns to aiming, and says so.
                .catch(error => {
                  setLastRead(undefined);
                  setCaptureError(String(error));
                  setPoorRead(true);
                  setStage('aiming');
                });
            }
          : undefined
      }
      sheet={
        // A failed read, on a development build, says what it got rather than
        // only that it failed — the diagnosis belongs where the failure is.
        poorRead && __DEV__ ? (
          <ReadDebug read={lastRead} error={captureError} />
        ) : stage === 'result' ? (
          <LabelResultSheet
            rows={labelRead ? toLabelRows(labelRead) : labelRows}
            servingG={labelRead?.reading.servingG ?? labelServingG}
            unread={labelRead?.reading.unread}
            column={column}
            onColumn={setColumn}
            onFix={() => onCreateFromLabel?.(labelRead?.reading ?? labelReading)}
            onSave={() => onCreateFromLabel?.(labelRead?.reading ?? labelReading)}
          />
        ) : undefined
      }>
      {liveLabel ? (
        <Preview outputs={outputsOf(labelReader.photoOutput)} torch={torch} />
      ) : (
        <NutritionLabel />
      )}
    </Viewfinder>
  );
}
