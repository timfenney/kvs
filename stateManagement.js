const constants = require('./constants.js');
const { ADD, GET, REMOVE, LOCK_FAIL, LOAD_FAIL, STORE_FAIL } = constants;

/* reducers */
const addReducer = ({prevState, action}) => {
  const { key, value } = action;
  return { ...prevState, [key]: value, };
};

const identityReducer = ({prevState}) => {
  return prevState;
};

const removeReducer = ({prevState, action}) => {
  const { key } = action;
  const {[key]: deletedKey, ...nextState} = prevState;
  return nextState;
};

const REDUCERS = Object.freeze({
  [ADD]: addReducer,
  [GET]: identityReducer,
  [REMOVE]: removeReducer,
});

const reducer = ({prevState, action}) => {
  const { type } = action;
  const actionReducer = REDUCERS[type];
  return actionReducer({prevState, action});
};

/* queries */
const getQuery = ({state, action}) => {
  const { key } = action;
  return state[key];
};

const nullQuery = () => {};

const QUERIES = Object.freeze({
  [ADD]: nullQuery,
  [GET]: getQuery,
  [REMOVE]: nullQuery,
});

const query = (args) => {
  const { action: { type } } = args;
  const theQuery = QUERIES[type];
  const value = theQuery(args);
  return value;
};


const makeDispatch = ({store, load, withExclusiveLock}) => (args) => {
  let result = null;
  let error = null;
  try {
    withExclusiveLock(() => {
      let prevDb = null;
      try {
        prevDb = load();
      } catch(e) {
        console.log('eee', e);
        error = LOAD_FAIL;
        throw e;
      }
      const nextDb = reducer({prevState: prevDb, action: args});
      try {
        store(nextDb);
      } catch(e) {
        error = STORE_FAIL;
        throw e;
      }
      result = query({state: nextDb, action: args});
    });
  } catch(e) {
    if (!error) {
      error = LOCK_FAIL;
    }
  }
  if (error) {
    return { error };
  }
  return { result };
};

module.exports = {
  makeDispatch,
};