const fs = require('fs');
const KVS_PATH = './.kvs';
const DB_PATH = `${KVS_PATH}/db`;
const LOCK_DIR_PATH = `${KVS_PATH}/lock`;

function ensureDir() {
  /*
    Make the directory, in case it doesn't exist.
    With { recursive: true }, no error occurs if it exists.
    We could check for existence, but the fix would be to create it anyway.
  */
  fs.mkdirSync(KVS_PATH, { recursive: true });
}

function withExclusiveLock(perform) {
  ensureDir();
  fs.mkdirSync(LOCK_DIR_PATH);
  const result = perform();
  try {
    fs.rmdirSync(LOCK_DIR_PATH);
  } catch(e) {
    /*
      TODO FIXME
      Do nothing, these exceptions are lower risk.
      Although a more robust system would handle them.
    */
  }
  return result;
}

function init() {
  ensureDir();
  try {
    fs.rmdirSync(LOCK_DIR_PATH);
  } catch(e) {
    /* Do nothing */
  }
  try {
    fs.unlinkSync(DB_PATH);
  } catch(e) {
    /* Do nothing */
  }
  const result = store({});
  return { result };
}

function load() {
  const dbContents = fs.readFileSync(DB_PATH);
  const db = JSON.parse(dbContents);
  return db;
}

function store(db) {
  const serialized = JSON.stringify(db);
  fs.writeFileSync(DB_PATH, serialized);
}

module.exports = {
  init,
  load,
  store,
  withExclusiveLock,
};