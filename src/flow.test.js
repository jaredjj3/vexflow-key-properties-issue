const { Flow } = require('vexflow');

it.each([1, 10, 100, 1000, 10_000, 100_000])('calls Flow.keyProperties %d time(s)', (times) => {
  expect(() => {
    for (let i = 0; i < times; i++) {
      Flow.keyProperties('C/4');
    }
  }).not.toThrow();
});
