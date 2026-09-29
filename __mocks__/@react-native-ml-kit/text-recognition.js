/**
 * On-device OCR, standing still. The default is an empty read; a test that
 * cares sets __setOcr({blocks}) and drives the parser through it.
 *
 * The native module is registered too, because that is what native.ts actually
 * checks for — a pod that never got installed leaves the JS half looking
 * perfectly healthy. __setOcrNative(false) is that build.
 */
const {NativeModules} = require('react-native');

const state = {result: {text: '', blocks: []}};

const recognize = jest.fn(() => Promise.resolve(state.result));

NativeModules.TextRecognition = {recognize};

module.exports = {
  __esModule: true,
  default: {recognize},
  TextRecognitionScript: {LATIN: 'Latin'},
  __setOcr: result => {
    state.result = result;
  },
  /** Whether this build got its pod. Set before the module under test loads. */
  __setOcrNative: present => {
    if (present) {
      NativeModules.TextRecognition = {recognize};
    } else {
      delete NativeModules.TextRecognition;
    }
  },
};
