import { mapLocationToDateState, tryCatchDate } from './util';
import fixtures from '../../fixtures';
const state = fixtures.getState();

test('parses date 1.1', () => {
  const d = new Date(Date.UTC(2013, 0, 5));
  let param = {
    time: '2013-01-05'
  };
  let stateFromLocation = {
    date: {}
  };

  stateFromLocation = mapLocationToDateState(param, stateFromLocation, state);
  expect(stateFromLocation.date.selected).toMatchObject(d);
});
test('parses valid date: 1.2', () => {
  let d = new Date(Date.UTC(2013, 0, 5));
  let param = {
    t: '2013-01-05'
  };
  let date = tryCatchDate(param.t, state.date.appNow);
  expect(date).toEqual(d);
});
test('If date is invalid, uses pageLoad Time', () => {
  let param = {
    time: 'X'
  };
  let stateFromLocation = {
    date: state.date
  };
  stateFromLocation = mapLocationToDateState(param, stateFromLocation, state);

  expect(stateFromLocation.date.selected).toBe(state.date.appNow);
});