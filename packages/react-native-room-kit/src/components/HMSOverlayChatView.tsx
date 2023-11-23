import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import { HMSKeyboardAvoidingView } from './HMSKeyboardAvoidingView';
import { HMSSendMessageInput } from './HMSSendMessageInput';
import { HMSHLSMessageList } from './HMSHLSMessageList';
import { useFooterHeight } from './Footer';
import { useHMSNotificationsHeight } from './HMSNotifications';
import { ChatFilterBottomSheetOpener } from './Chat/ChatFilterBottomSheetOpener';
import { ChatMoreActionsModal } from './Chat/ChatMoreActionsModal';
import { ChatFilterBottomSheet } from './Chat/ChatFilterBottomSheet';
import { ChatPaused } from './Chat/ChatPaused';
import { useHMSChatState } from '../hooks-util';

const colors = [
  'rgba(0, 0, 0, 0)',
  'rgba(255, 255, 255, 1)',
  'rgba(255, 255, 255, 1)',
];
const colorLocations = [0, 0.4, 1];

export const HLSChatView = () => {
  const footerHeight = useFooterHeight();
  const hmsNotificationsHeight = useHMSNotificationsHeight();
  const { chatState } = useHMSChatState();

  return (
    <>
      <HMSKeyboardAvoidingView
        bottomOffset={footerHeight + hmsNotificationsHeight}
      >
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

        {chatState.enabled ? (
          <>
            <View style={styles.filterSheetWrapper}>
              <ChatFilterBottomSheetOpener insetMode={true} />
            </View>
            <HMSSendMessageInput />
          </>
        ) : (
          <ChatPaused insetMode={true} style={styles.chatPaused} />
        )}
      </HMSKeyboardAvoidingView>

      <ChatFilterBottomSheet />
      <ChatMoreActionsModal />
    </>
  );
};

const styles = StyleSheet.create({
  filterSheetWrapper: {
    marginHorizontal: 8,
    marginTop: 8,
  },
  chatPaused: {
    marginHorizontal: 8,
    marginBottom: 38,
  },
});
