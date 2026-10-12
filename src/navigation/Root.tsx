import React, {useEffect, useState} from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import Onboarding from '../screens/Onboarding';
import type {Step} from '../screens/Onboarding';
import Today from '../screens/Today';
import AddFood from '../screens/AddFood';
import CreateFood from '../screens/CreateFood';
import Scan from '../screens/Scan';
import ScalePhoto from '../screens/ScalePhoto';
import DayPicker from '../screens/DayPicker';
import PortionEdit from '../screens/PortionEdit';
import WeighIn from '../screens/WeighIn';
import WeightTrend from '../screens/WeightTrend';
import Settings from '../screens/Settings';

import LoadingScreen from '../components/LoadingScreen';
import {fromReading} from '../domain/food';
import {kyel, kyelsGoal} from '../fixtures/profile';
import {memoryStore} from '../store/memory';
import type {Setup, SetupStore} from '../store/setup';
import {dayFor, dayMarks, stepDay} from '../fixtures/days';
import {isoDate} from '../domain/calendar';
import {fourWeeks, todaysReading, yesterdaysReading} from '../fixtures/weight';
import {useThemeName} from '../theme';
import type {Mode} from '../components/Viewfinder';
import type {ScanStage} from '../screens/Scan';
import type {LabelReading} from '../readers/label';

export type RootParams = {
  /** Setup, all of it. One screen, five faces — see screens/Onboarding. */
  Onboarding: {step?: Step} | undefined;
  Today: undefined;
  AddFood: undefined;
  /** Opened from the label reader, the panel it read comes with it. */
  CreateFood: {reading?: LabelReading} | undefined;
  /** One screen, three readers. `missing` walks the unhappy barcode path. */
  Scan: {mode?: Mode; stage?: ScanStage; missing?: boolean} | undefined;
  Portion: undefined;
  DayPicker: undefined;
  WeighIn: undefined;
  ScalePhoto: undefined;
  Weight: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootParams>();

type Props<K extends keyof RootParams> = NativeStackScreenProps<RootParams, K>;

/**
 * One stack, no tab bar: logging happens many times a day and navigating
 * rarely, so the bottom bar stays with Scan and Log food and Today's header
 * carries the rest. See the Navigation note in docs/agents/../PRD.
 */
export default function Root({
  store: given,
  initialRoute,
}: {
  /**
   * Where setup is kept. ADR-0007: the gate, not the store. The app passes one
   * that outlives this component; left out, setup lasts as long as the mount,
   * which is what a screen walked on its own wants.
   */
  store?: SetupStore;
  /** Jump straight to a screen, for tests and for walking the boards. */
  initialRoute?: keyof RootParams;
}) {
  /** `useState` and not a default argument: a default would build a new store, and lose what was in it, on every render. */
  const [fallback] = useState(memoryStore);
  const store = given ?? fallback;

  /**
   * The saved setup: `undefined` while the store is being read, `null` once it
   * has answered that there is none.
   *
   * A store that can answer synchronously answers here, in the initialiser, so
   * `undefined` never happens and the loading frame never draws. One that
   * cannot — AsyncStorage, or MMKV in a build with no pod — starts `undefined`
   * and the effect below fills it in.
   */
  const [setup, setSetup] = useState<Setup | null | undefined>(
    () => store.peek?.(),
  );
  const waiting = setup === undefined;

  useEffect(() => {
    if (!waiting) {
      return;
    }
    let live = true;
    store
      .read()
      // A store that cannot be read is a store with nothing in it. Asking the
      // four questions again beats opening Today on a guess.
      .catch(() => null)
      .then(saved => {
        if (live) {
          setSetup(saved);
        }
      });
    return () => {
      live = false;
    };
  }, [store, waiting]);

  const profile = setup?.profile ?? kyel;
  const goal = setup?.goal ?? kyelsGoal;

  /**
   * Which day the app is looking at, as an ISO date. History is not a screen —
   * it is Today on another day (ADR-0002) — so this one piece of state is what
   * makes the day picker and the stepper mean anything.
   */
  const today = new Date();
  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const [dayIso, setDayIso] = useState(todayIso);
  const marks = dayMarks(today);
  const day = dayFor(dayIso, today, marks);
  const dark = useThemeName() === 'dark';

  if (waiting) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute ?? (setup ? 'Today' : 'Onboarding')}
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Onboarding">
          {({navigation, route}: Props<'Onboarding'>) => (
            <Onboarding
              profile={profile}
              goal={goal}
              step={route.params?.step}
              onLeave={navigation.goBack}
              onDone={saved => {
                setSetup(saved);
                // The gate already knows, so a failed write costs the next
                // launch the questions again and nothing more — but it is said
                // out loud rather than swallowed, which is how the first
                // version of this hid a missing pod for a whole build.
                store.write(saved).catch((error: unknown) => {
                  console.warn(
                    `[scranly] setup could not be saved, so it will be asked again next launch: ${String(error)}`,
                  );
                });
                navigation.reset({index: 0, routes: [{name: 'Today'}]});
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Today">
          {({navigation}: Props<'Today'>) => (
            <Today
              day={day}
              onScan={() => navigation.navigate('Scan')}
              onLogFood={() => navigation.navigate('AddFood')}
              onWeek={() => navigation.navigate('Weight')}
              onDay={() => navigation.navigate('DayPicker')}
              onEdit={() => navigation.navigate('AddFood')}
              onSettings={() => navigation.navigate('Settings')}
              onStarter={() => navigation.navigate('AddFood')}
              onPrevDay={() => setDayIso(stepDay(dayIso, -1, today))}
              onNextDay={() => setDayIso(stepDay(dayIso, 1, today))}
              onToday={() => setDayIso(todayIso)}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="AddFood" options={{presentation: 'modal'}}>
          {({navigation}: Props<'AddFood'>) => (
            <AddFood
              onBack={navigation.goBack}
              onScan={() => navigation.navigate('Scan')}
              onCreate={() => navigation.navigate('CreateFood')}
              onAdd={navigation.goBack}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="CreateFood">
          {({navigation, route}: Props<'CreateFood'>) => (
            <CreateFood
              // Filled from the label when there was one, which is what the
              // 'Scan the label instead' shortcut has always promised.
              initial={
                route.params?.reading
                  ? fromReading(route.params.reading)
                  : undefined
              }
              onBack={navigation.goBack}
              onScanLabel={() => navigation.navigate('Scan', {mode: 'label'})}
              onSave={navigation.goBack}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Scan" options={{presentation: 'fullScreenModal'}}>
          {({navigation, route}: Props<'Scan'>) => (
            <Scan
              mode={route.params?.mode}
              stage={route.params?.stage}
              missing={route.params?.missing}
              onClose={navigation.goBack}
              onAdd={navigation.goBack}
              onCreateFromLabel={reading =>
                navigation.navigate('CreateFood', {reading})
              }
              onWeighPortion={() => navigation.navigate('Portion')}
              onTypeItIn={() => navigation.navigate('CreateFood')}
            />
          )}
        </Stack.Screen>

        {/* Over Today, not instead of it: you are picking a day to look at. */}
        <Stack.Screen
          name="DayPicker"
          options={{presentation: 'transparentModal', animation: 'fade'}}>
          {({navigation}: Props<'DayPicker'>) => (
            <DayPicker
              today={today}
              marks={marks}
              selected={dayIso}
              onSelect={iso => {
                setDayIso(iso);
                navigation.goBack();
              }}
              onToday={() => {
                setDayIso(todayIso);
                navigation.goBack();
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Portion" options={{presentation: 'fullScreenModal'}}>
          {({navigation}: Props<'Portion'>) => (
            <PortionEdit onClose={navigation.goBack} onSave={navigation.goBack} />
          )}
        </Stack.Screen>

        <Stack.Screen name="WeighIn">
          {({navigation}: Props<'WeighIn'>) => (
            <WeighIn
              startKg={todaysReading}
              yesterdayKg={yesterdaysReading}
              averageKg={79.8}
              date="Fri 25 Sep"
              onBack={navigation.goBack}
              onPhoto={() => navigation.navigate('ScalePhoto')}
              onSave={navigation.goBack}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Weight">
          {({navigation}: Props<'Weight'>) => (
            <WeightTrend
              readings={fourWeeks}
              goalKg={goal.targetWeightKg}
              weeksRemaining={goal.weeks}
              goalDate="24 November"
              onBack={navigation.goBack}
              onAdd={() => navigation.navigate('WeighIn')}
              onChangeGoal={() => navigation.navigate('Onboarding', {step: 'goal'})}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="ScalePhoto" options={{presentation: 'fullScreenModal'}}>
          {({navigation}: Props<'ScalePhoto'>) => (
            <ScalePhoto
              reading={todaysReading}
              yesterdayKg={yesterdaysReading}
              averageKg={79.8}
              onClose={navigation.goBack}
              onSave={navigation.goBack}
              onFix={navigation.goBack}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Settings">
          {({navigation}: Props<'Settings'>) => (
            <Settings onBack={navigation.goBack} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
