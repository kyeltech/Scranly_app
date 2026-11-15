#import <React/RCTBridgeModule.h>

/**
 * Registers the Swift class above with React Native.
 *
 * Swift cannot do this itself — the macro is Objective-C — so this file exists
 * for one line. Both files have to be in the Xcode target for the constants to
 * reach JS; `src/version.ts` carries on without them if they do not.
 */
@interface RCT_EXTERN_MODULE(AppVersion, NSObject)
@end
