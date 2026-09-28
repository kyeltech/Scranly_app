/**
 * On-device OCR, standing still. The default is an empty read; a test that
 * cares sets __setOcr({blocks}) and drives the parser through it.
 */
const state = {result: {text: '', blocks: []}};

module.exports = {
  __esModule: true,
  default: {recognize: jest.fn(() => Promise.resolve(state.result))},
  TextRecognitionScript: {LATIN: 'Latin'},
  __setOcr: result => {
    state.result = result;
  },
};
