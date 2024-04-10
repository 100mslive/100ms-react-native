import * as React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { HLSHandRaiseButton } from './HLSHandRaiseButton';
import { HLSRoomOptionsButton } from './HLSRoomOptionsButton';
import { HLSManageChatTextInput } from './HLSManageChatTextInput';

export const HLSChatFooterView = () => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    container: {
      backgroundColor: theme.palette.surface_dim,
      borderBottomColor: theme.palette.border_bright,
    },
    input: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.surface_default,
    },
  }));

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, hmsRoomStyles.container]}
    >
      <HLSManageChatTextInput />

      <HLSHandRaiseButton />

      <HLSRoomOptionsButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    // alignItems: 'center',
    alignItems: 'flex-end',
  },
  input: {
    flex: 0,
    height: 40,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  chatPaused: {
    flexShrink: 1,
  },
});
