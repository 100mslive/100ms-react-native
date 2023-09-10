import * as React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { HMSKeyboardAvoidingView } from './HMSKeyboardAvoidingView';
import { HMSSendMessageInput } from './HMSSendMessageInput';
import { HMSHLSMessageList } from './HMSHLSMessageList';

const colors = [
  'rgba(0, 0, 0, 0)',
  'rgba(255, 255, 255, 1)',
  'rgba(255, 255, 255, 1)',
];
const colorLocations = [0, 0.4, 1];

export const HLSChatView = () => {
  return (
    <HMSKeyboardAvoidingView>
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
