#!/usr/bin/env node

const { init, load, store, withExclusiveLock } = require('./repository');
const { parse } = require('./parsing');
const { makeDispatch } = require('./stateManagement');
const { print } = require('./print');
const { INIT } = require('./constants');

const dispatch = makeDispatch({load, store, withExclusiveLock});

function main() {
  let type = null;
  let action = null;
  try {
    const parseResult = parse();
    type = parseResult.type;
    action = parseResult.action;
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
  if (type === INIT) {
    const result = init();
    print({type, result});
  } else {
    const result = dispatch(action);
    print({type, result});
  }
};

main();