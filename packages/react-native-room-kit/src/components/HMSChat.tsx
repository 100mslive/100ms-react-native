import * as React from 'react';

import { ChatIcon } from '../Icons';
import { PressableIcon } from './PressableIcon';
import { useShowChat } from '../hooks-util';

export const HMSChat = () => {
  const [chatVisibleType, setChatVisible] = useShowChat();

  const toggleChatWindow = () => setChatVisible(chatVisibleType === 'none');

  return (
    <PressableIcon
      onPress={toggleChatWindow}
      active={chatVisibleType === 'inset'}
    >
      <ChatIcon />
    </PressableIcon>
  );
};
