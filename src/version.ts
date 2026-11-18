import {NativeModules} from 'react-native';

/**
 * Which build this is.
 *
 * Read at runtime from the bundle's own Info.plist through `ios/Scranly/
 * AppVersion.swift`, so it is the version the binary actually carries rather
 * than a number copied into the JS at build time. `package.json` is not it, and
 * neither is anything generated: Xcode's MARKETING_VERSION and
 * CURRENT_PROJECT_VERSION are the one source of truth.
 *
 * All three are optional on purpose. A build without the native files in its
 * target — or a platform they have not been written for yet — gets `undefined`,
 * and everything downstream is built to carry on: no what's-new sheet on
 * launch, no notice row, and the Settings row still opens the newest release in
 * the list, which says which release it describes. The same honesty as the
 * camera and the store: a thing that cannot answer says so, rather than
 * answering wrongly.
 */
type Native = {version?: string; build?: string; beta?: boolean};

const native = (NativeModules as {AppVersion?: Native}).AppVersion;

const nonEmpty = (value: string | undefined) =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

export const version = nonEmpty(native?.version);
export const build = nonEmpty(native?.build);

/** True for a TestFlight build: the only one that expires, and says so. */
export const beta = native?.beta === true;

/**
 * Say so, once, in a development build.
 *
 * The silent version of this is a sheet that never appears and no way to tell
 * whether that is the rule working or the module missing — the same trap the
 * store fell into before `storeFailure`. Called from `App.tsx` rather than at
 * import, so it is the app that complains and not every test that happens to
 * pull this file in.
 */
export function warnIfUnknown(): void {
  if (__DEV__ && version === undefined) {
    console.warn(
      '[scranly] no AppVersion module, so the build is unknown: ' +
        'add ios/Scranly/AppVersion.swift and AppVersion.m to the Xcode target.',
    );
  }
}
