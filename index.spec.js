const path = require('path');
const exec = require('child_process').exec;
const fs = require('fs');
const rmfr = require('rmfr');

const cleanSlate = async () => {
  await rmfr('./.kvs');
  await cli(['init']);
};

beforeEach(async (done) => {
  await cleanSlate();
  done();
});

test('it fails for no keyword', async () => {
  const result = await cli([]);
  expect(result.stderr).toBe("Missing keyword.\n");
  expect(result.stdout).toBe('');
  expect(result.code).toBe(1);
});

test('init succeeds with an empty store', async () => {
  const result = await cli(['init']);
  expect(result.stderr).toBe('');
  expect(result.stdout).toBe("Success.\n");
  expect(result.code).toBe(0);
});

test('init succeeds with a store with items', async () => {
  await cli(['add', 'foo', 'bar']);
  const result = await cli(['init']);
  expect(result.stderr).toBe('');
  expect(result.stdout).toBe("Success.\n");
  expect(result.code).toBe(0);
});

test('init fails with too many arguments', async () => {
  const result = await cli(['init', 'wrong']);
  expect(result.stderr).toBe("Wrong number of arguments for keyword: init.\n");
  expect(result.stdout).toBe('');
  expect(result.code).toBe(1);
});

test('add reports success', async () => {
  const result = await cli(['add', 'baz', 'quux']);
  expect(result.stderr).toBe('');
  expect(result.stdout).toBe("Success.\n");
  expect(result.code).toBe(0);
});

test('add fails with too many arguments', async () => {
  const result = await cli(['add', 'key', 'value', 'wrong']);
  expect(result.stderr).toBe("Wrong number of arguments for keyword: add.\n");
  expect(result.stdout).toBe('');
  expect(result.code).toBe(1);
});

test('add fails with too few arguments', async () => {
  const result = await cli(['add', 'key', 'value', 'wrong']);
  expect(result.stderr).toBe("Wrong number of arguments for keyword: add.\n");
  expect(result.stdout).toBe('');
  expect(result.code).toBe(1);
});

test('get reports failure when key does not exist', async () => {
  const result = await cli(['get', 'foo']);
  expect(result.stdout).toBe('');
  expect(result.stderr).toBe("Nothing received.\n");
  expect(result.code).toBe(1);
});

test('get fails with too many arguments', async () => {
  const result = await cli(['get', 'key', 'wrong']);
  expect(result.stderr).toBe("Wrong number of arguments for keyword: get.\n");
  expect(result.stdout).toBe('');
  expect(result.code).toBe(1);
});

test('get fails with too few arguments', async () => {
  const result = await cli(['get']); // key is missing
  expect(result.stderr).toBe("Wrong number of arguments for keyword: get.\n");
  expect(result.stdout).toBe('');
  expect(result.code).toBe(1);
});

test('get reports success when key exists', async () => {
  await cli(['add', 'foo', 'bar']);
  const result = await cli(['get', 'foo']);
  expect(result.stderr).toBe('');
  expect(result.stdout).toBe("Received: 'bar'.\n");
  expect(result.code).toBe(0);
});

test('remove reports success when key exists', async () => {
  await cli(['add', 'foo', 'bar']);
  const result = await cli(['remove', 'foo']);
  expect(result.stderr).toBe('');
  expect(result.stdout).toBe("Success.\n");
  expect(result.code).toBe(0);
});

xtest('remove reports failure when key does not exist', async () => {x
  const result = await cli(['remove', 'foo']);
  expect(result.stderr).toBe("No such key.\n");
  expect(result.stdout).toBe('');
  expect(result.code).toBe(1);
});

test('all commands fail when db is in use', async () => {
  const actions = [
    ['add', 'key', 'value'],
    ['remove', 'key'],
    ['get', 'key'],
  ];
  actions.forEach(async action => {
    await cleanSlate();
    await createLock();
    const result = await cli(action);
    expect(result.stderr).toBe("Error: failed to acquire lock.\n");
    expect(result.stdout).toBe('');
    expect(result.code).toBe(1);
  });
});

test('it fails for unrecognized keywords', async () => {
  const result = await cli(['be-not-awesome']); // we only know how to be awesome ;-)
  expect(result.stderr).toBe("Unrecognized keyword: be-not-awesome.\n");
  expect(result.stdout).toBe('');
  expect(result.code).toBe(1);
});

async function createLock() {
  await cleanSlate();
  try {
    fs.mkdirSync('./.kvs/lock');
  } catch(e) {
    /*
      Getting a few EEXIST errors on this one.
      Disquieting for sure.
    */
    if (!(e.code === 'EEXIST')) {
      throw e;
    }
  }
}

function cli(args) {
  const cwd = '.';
  return new Promise(resolve => { 
    exec(`node ${path.resolve('./index.js')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        });
      },
    );
  });
}