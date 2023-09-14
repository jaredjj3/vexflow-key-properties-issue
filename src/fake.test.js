const { Fake } = require('./fake');

it.each([1, 10, 100, 1000, 10_000, 100_000])('calls Fake.keyProperties %d time(s)', (times) => {
  expect(() => {
    for (let i = 0; i < times; i++) {
      Fake.keyProperties('C/4');
    }
  }).not.toThrow();
});
