/** On-device OCR, standing still. Tests that care drive the parser directly. */
module.exports = {
  recognize: jest.fn().mockResolvedValue({blocks: []}),
  recognizeText: jest.fn().mockResolvedValue(''),
};
