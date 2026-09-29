import type * as React from 'react';

import { splitLinksAndContent } from './functions';

jest.mock('@100mslive/react-native-hms', () => ({}), { virtual: true });
jest.mock('react-native-simple-toast', () => ({}), { virtual: true });

describe('splitLinksAndContent', () => {
  const options = { pressHandler: jest.fn(), style: {} };

  it('returns the text when there is no link', () => {
    expect(splitLinksAndContent('hello world', options)).toBe('hello world');
  });

  it('keeps multiple links in the order they appear in the text', () => {
    const parts = splitLinksAndContent(
      'first https://one.example second https://two.example end',
      options
    ) as (string | React.ReactElement)[];

    const links = parts
      .filter((part): part is React.ReactElement => typeof part !== 'string')
      .map((element) => String(element.props.children).trim());

    expect(links).toEqual(['https://one.example', 'https://two.example']);
  });
});
