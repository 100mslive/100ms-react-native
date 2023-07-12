import * as React from 'react';
import {View} from 'react-native';

import {ChatIcon} from '../Icons';
import {PressableIcon} from './PressableIcon';
import {ChatWindow} from './ChatWindow';
import {DefaultModal} from './DefaultModal';
import {useShowChat} from '../hooks-util';

export const HMSChat = () => {
  const [chatVisibleType, setChatVisible] = useShowChat();

  const toggleChatWindow = () => setChatVisible(chatVisibleType === 'none');

  const closeChatWindow = () => setChatVisible(false);

  return (
    <View>
      <PressableIcon
        onPress={toggleChatWindow}
        active={chatVisibleType === 'inset'}
      >
        <ChatIcon />
      </PressableIcon>

      <DefaultModal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        modalVisible={chatVisibleType === 'modal'}
        setModalVisible={closeChatWindow}
      >
        <ChatWindow />
      </DefaultModal>
    </View>
  );
};
