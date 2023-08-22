import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { Footer } from './Footer';
import { AnimatedHLSFooter } from './AnimatedHLSFooter';
import { HLSChatView } from './HLSChatView';
import { useShowChat } from '../hooks-util';

interface HLSFooterProps {
  offset: SharedValue<number>;
}

export const HLSFooter: React.FC<HLSFooterProps> = ({ offset }) => {
  const [showChat] = useShowChat();

  return (
    <AnimatedHLSFooter offset={offset} style={styles.animatedContainer}>
      {showChat === 'inset' ? <HLSChatView /> : null}

      <Footer />
    </AnimatedHLSFooter>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});
