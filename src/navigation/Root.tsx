import React, {useState} from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import Welcome from '../screens/Welcome';
import AboutYou from '../screens/AboutYou';
import GoalScreen from '../screens/Goal';
import MethodScreen from '../screens/Method';
import TargetsScreen from '../screens/Targets';
import Today from '../screens/Today';
import AddFood from '../screens/AddFood';
import CreateFood from '../screens/CreateFood';
import ScanResult from '../screens/ScanResult';
import PortionEdit from '../screens/PortionEdit';
import WeighIn from '../screens/WeighIn';
import WeightTrend from '../screens/WeightTrend';
import Settings from '../screens/Settings';

import {dailyPlan} from '../domain/targets';
import type {Goal, Profile} from '../domain/targets';
import {kyel, kyelsGoal} from '../fixtures/profile';
import {aNormalDay} from '../fixtures/days';
import {fourWeeks, todaysReading, yesterdaysReading} from '../fixtures/weight';
import {useThemeName} from '../theme';

export type RootParams = {
  Welcome: undefined;
  AboutYou: undefined;
  Goal: undefined;
  Method: undefined;
  Targets: undefined;
  Today: undefined;
  AddFood: undefined;
  CreateFood: undefined;
  Scan: {state?: 'looking' | 'found' | 'nomatch'} | undefined;
  Portion: undefined;
  WeighIn: undefined;
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
export default function Root({initialRoute = 'Welcome'}: {initialRoute?: keyof RootParams}) {
  const [profile, setProfile] = useState<Profile>(kyel);
  const [goal, setGoal] = useState<Goal>(kyelsGoal);
  const {targets} = dailyPlan(profile, goal);
  const dark = useThemeName() === 'dark';

  return (
    <NavigationContainer theme={dark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Welcome">
          {({navigation}: Props<'Welcome'>) => (
            <Welcome onStart={() => navigation.navigate('AboutYou')} />
          )}
        </Stack.Screen>

        <Stack.Screen name="AboutYou">
          {({navigation}: Props<'AboutYou'>) => (
            <AboutYou
              profile={profile}
              onBack={navigation.goBack}
              onContinue={next => {
                setProfile(next);
                navigation.navigate('Goal');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Goal">
          {({navigation}: Props<'Goal'>) => (
            <GoalScreen
              profile={profile}
              onBack={navigation.goBack}
              onContinue={next => {
                setGoal(next);
                navigation.navigate('Method');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Method">
          {({navigation}: Props<'Method'>) => (
            <MethodScreen
              onBack={navigation.goBack}
              onContinue={() => navigation.navigate('Targets')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Targets">
          {({navigation}: Props<'Targets'>) => (
            <TargetsScreen
              targets={targets}
              weightKg={profile.weightKg}
              onBack={navigation.goBack}
              onDone={() => navigation.reset({index: 0, routes: [{name: 'Today'}]})}
              onAdjust={() => navigation.navigate('Method')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Today">
          {({navigation}: Props<'Today'>) => (
            <Today
              day={aNormalDay}
              onScan={() => navigation.navigate('Scan', {state: 'found'})}
              onLogFood={() => navigation.navigate('AddFood')}
              onWeek={() => navigation.navigate('Weight')}
              onSettings={() => navigation.navigate('Settings')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="AddFood" options={{presentation: 'modal'}}>
          {({navigation}: Props<'AddFood'>) => (
            <AddFood
              onBack={navigation.goBack}
              onScan={() => navigation.navigate('Scan', {state: 'found'})}
              onCreate={() => navigation.navigate('CreateFood')}
              onAdd={navigation.goBack}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="CreateFood">
          {({navigation}: Props<'CreateFood'>) => (
            <CreateFood
              onBack={navigation.goBack}
              onScanLabel={() => navigation.navigate('Scan', {state: 'nomatch'})}
              onSave={navigation.goBack}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Scan" options={{presentation: 'fullScreenModal'}}>
          {({navigation, route}: Props<'Scan'>) => (
            <ScanResult
              state={route.params?.state ?? 'found'}
              onClose={navigation.goBack}
              onAdd={navigation.goBack}
              onRetry={navigation.goBack}
              onAddFromLabel={() => navigation.navigate('CreateFood')}
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
              onBack={navigation.goBack}
              onPhoto={() => navigation.navigate('Scan', {state: 'found'})}
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
              onChangeGoal={() => navigation.navigate('Goal')}
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
