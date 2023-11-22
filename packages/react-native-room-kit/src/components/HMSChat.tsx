import * as React from 'react';

import { ChatIcon } from '../Icons';
import { PressableIcon } from './PressableIcon';
import { useShowChatAndParticipants } from '../hooks-util';
import { TestIds } from '../utils/constants';

export const HMSChat = () => {
  const { overlayChatVisible, show, hide } = useShowChatAndParticipants();

  const toggleChatWindow = () => {
    if (overlayChatVisible) {
      hide('chat_overlay');
    } else {
      show('chat');
    }
  };

  return (
    <PressableIcon
      testID={overlayChatVisible ? TestIds.close_chat_btn : TestIds.open_chat_btn}
      onPress={toggleChatWindow}
      active={overlayChatVisible}
    >
      <ChatIcon />
    </PressableIcon>
  );
};
