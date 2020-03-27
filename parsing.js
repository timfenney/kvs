const { ADD, GET, INIT, REMOVE } = require('./constants.js');
const FIRST_ARGUMENT_INDEX = 2;
const KEY = 1;
const VALUE = 2;
const TYPE = 0;

const validateArguments = ({ expected, received, type}) => {
  if (expected !== received) {
    throw new Error(`Wrong number of arguments for keyword: ${type}.`);
  }
};
  
const keyParser = args => {
  const type = args[TYPE];
  validateArguments({expected: 2, received: args.length, type });
  return { key: args[KEY] };
};

const keyAndValueParser = args => {
  const type = args[TYPE];
  validateArguments({expected: 3, received: args.length, type });
  return { key: args[KEY], value: args[VALUE] };
};

const typeParser = args => {
  const type = args[TYPE];
  validateArguments({expected: 1, received: args.length, type });
  return {};
}

const PARSERS = Object.freeze({
  [ADD]: keyAndValueParser,
  [GET]: keyParser,
  [INIT]: typeParser,
  [REMOVE]: keyParser,
});

const parse = () => {
  const argv = process.argv;
  const args = argv.slice(FIRST_ARGUMENT_INDEX);
  const type = args[TYPE];
  const parseFunction = PARSERS[type];
  if (!parseFunction) {
    if (typeof type === 'undefined') {
      console.error('Missing keyword.');
    } else {
      console.error(`Unrecognized keyword: ${ type }.`);
    }
    process.exit(1);
  }
  const action = { type, ...parseFunction(args), };
  return { type, action };
}

module.exports = {
  parse,
};