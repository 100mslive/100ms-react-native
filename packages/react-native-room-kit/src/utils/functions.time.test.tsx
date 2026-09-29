import { getTimeStringin12HourFormat } from './functions';

jest.mock('@100mslive/react-native-hms', () => ({}), { virtual: true });
jest.mock('react-native-simple-toast', () => ({}), { virtual: true });

describe('getTimeStringin12HourFormat', () => {
  it.each([
    [0, 5, '12:05 AM'],
    [1, 30, '01:30 AM'],
    [11, 59, '11:59 AM'],
    [12, 0, '12:00 PM'],
    [12, 30, '12:30 PM'],
    [13, 15, '01:15 PM'],
    [23, 59, '11:59 PM'],
  ])('formats %i:%i', (hours, minutes, expected) => {
    expect(
      getTimeStringin12HourFormat(new Date(2026, 0, 1, hours, minutes))
    ).toBe(expected);
  });
});
