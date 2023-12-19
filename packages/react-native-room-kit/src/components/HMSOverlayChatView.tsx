import * as React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDerivedValue, interpolate } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { HMSKeyboardAvoidingView } from './HMSKeyboardAvoidingView';
import { HMSSendMessageInput } from './HMSSendMessageInput';
import { HMSHLSMessageList } from './HMSHLSMessageList';
import { useFooterHeight } from './Footer';
import { useHMSNotificationsHeight } from './HMSNotifications';

const colors = [
  'rgba(0, 0, 0, 0)',
  'rgba(255, 255, 255, 1)',
  'rgba(255, 255, 255, 1)',
];
const colorLocations = [0, 0.4, 1];

export interface HLSChatViewProps {
  offset?: SharedValue<number>;
}

export const HLSChatView: React.FC<HLSChatViewProps> = ({ offset }) => {
  const footerHeight = useFooterHeight();
  const hmsNotificationsHeight = useHMSNotificationsHeight();

  const chatBottomOffset = useDerivedValue(() => {
    if (offset) {
      return (
        interpolate(offset.value, [0, 1], [0, footerHeight]) +
        hmsNotificationsHeight
      );
    }
    return footerHeight + hmsNotificationsHeight;
  }, [offset, footerHeight, hmsNotificationsHeight]);

  return (
    <HMSKeyboardAvoidingView bottomOffset={chatBottomOffset}>
      <MaskedView
        maskElement={
          <LinearGradient
            pointerEvents="box-none"
            style={StyleSheet.absoluteFill}
            colors={colors}
            locations={colorLocations}
          />
        }
      >
        <HMSHLSMessageList />
      </MaskedView>

      <HMSSendMessageInput />
    </HMSKeyboardAvoidingView>
  );
};
