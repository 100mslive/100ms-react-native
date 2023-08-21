import * as React from 'react';
import type { SharedValue } from 'react-native-reanimated';

import { Footer } from './Footer';
import { AnimatedHLSFooter } from './AnimatedHLSFooter';

interface HLSFooterProps {
  offset: SharedValue<number>;
}

export const HLSFooter: React.FC<HLSFooterProps> = ({ offset }) => {
  return (
    <AnimatedHLSFooter offset={offset}>
      <Footer />
    </AnimatedHLSFooter>
  );
}
