import * as React from 'react';

import { ChatIcon } from '../Icons';
import { PressableIcon } from './PressableIcon';
import { useShowChatAndParticipants } from '../hooks-util';

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
    <PressableIcon onPress={toggleChatWindow} active={overlayChatVisible}>
      <ChatIcon />
    </PressableIcon>
  );
};
