import Foundation
import React

/**
 * The app's own version, read out of the bundle it is running in.
 *
 * React Native has no built-in way to ask this, and the alternative was a
 * dependency exposing dozens of device APIs to get two strings. This is those
 * two strings, plus whether the build came from TestFlight — which is the only
 * reason the app ever mentions updating at all, since a TestFlight build stops
 * opening ninety days after it goes out.
 *
 * `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` in the Xcode project are
 * the one source of truth: Xcode writes them into Info.plist as
 * CFBundleShortVersionString and CFBundleVersion, and this reads them back.
 * Nothing is copied at build time, so nothing can go stale.
 *
 * Constants rather than a method: they are available in the first JS frame, so
 * the what's-new sheet is decided before anything is drawn.
 */
@objc(AppVersion)
class AppVersion: NSObject {
  /** Nothing here touches UIKit, so it does not need the main queue. */
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func constantsToExport() -> [AnyHashable: Any]! {
    let info = Bundle.main.infoDictionary
    // A sandbox receipt is what a TestFlight build has and an App Store build
    // does not. It is also what a local build has, which is harmless: the row
    // it drives is a signpost, not a claim.
    let receipt = Bundle.main.appStoreReceiptURL?.lastPathComponent
    return [
      "version": info?["CFBundleShortVersionString"] as? String ?? "",
      "build": info?["CFBundleVersion"] as? String ?? "",
      "beta": receipt == "sandboxReceipt",
    ]
  }
}
