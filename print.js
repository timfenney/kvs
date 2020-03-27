
const { ADD, GET, INIT, REMOVE } = require('./constants.js');

const receivedPrint = ({result}) => console.log(`Received: '${ result }'.`);
const receivedNothingPrint = _ => console.error('Nothing received.');

const GET_PRINTS = Object.freeze({
  true: receivedPrint,
  false: receivedNothingPrint,
});

const EXIT_CODES = Object.freeze({
  true: 0,
  false: 1,
});

const getPrint = ({result}) => {
  const discriminant = typeof result === 'string';
  const getPrintByReceived = GET_PRINTS[discriminant];
  getPrintByReceived({result});
  const exitCode = EXIT_CODES[discriminant];
  process.exit(exitCode);
};

const successPrint = () => {
  console.log('Success.');
};

const PRINTS = Object.freeze({
  [ADD]: successPrint,
  [GET]: getPrint,
  [INIT]: successPrint,
  [REMOVE]: successPrint,
});

const print = ({ type, result: resultIn }) => {
  const result = resultIn.result;
  const error = resultIn.error;
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  PRINTS[type]({result, error});
};

module.exports = {
  print,
};