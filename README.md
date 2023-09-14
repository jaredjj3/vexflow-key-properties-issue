# vexflow-key-properties-issue

Reproduction repo for (#TBD).

## Environment

- MacBook Pro
- Chip: Apple M1 MAX
- OS: macOS Ventura 13.5.2 (22G91)
- Docker Desktop 4.23.0 (120376)
- Docker Engine: 24.0.6

## How to run

### Prerequisites

1. Install [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable).
2. Install [docker](https://docs.docker.com/engine/install/).
3. Run `yarn` in the root directory.

### Local

```shell
yarn test
```

Press `q` to open the menu.

**Expectations**:

- The tests run successfully in `O(ms)`.

### Docker (x86)

```shell
yarn test:docker
```

Press `q` to open the menu.

**Expectations**:

- The tests run successfully in `O(ms)`.

### Docker (amd64)

```shell
yarn test:docker:amd64
```

Press `q` to open the menu.

**Expectations**:

- If your host uses ARM architecture, the tests hang indefinitely.
- If your host does not use ARM archtecture, the tests run successfully in `O(ms)`.

## fake.js

[src/fake.js](src/fake.js) is the `Table.keyProperties` implementation 
([permalink](https://github.com/0xfe/vexflow/blob/207dc59e3a6659854898c488a0a186dbcc189acd/src/tables.ts#L595))
extracted into its own module. You can change this implementation and rerun the 
test to test theories. To rerun a test without killing the process, press `q` to
bring up the menu, then press `enter` to rerun.

I've observed that making the following change causes the tests in all
environments to run successfully:

_before_

```ts
octave += -1 * options.octave_shift;
```

_after_

```ts
octave -= options.octave_shift;
```
