import * as React from 'react';
import {View} from 'react-native';

import {ChatIcon} from '../Icons';
import {PressableIcon} from './PressableIcon';
import {ChatWindow} from './ChatWindow';
import {DefaultModal} from './DefaultModal';

export const HMSChat = () => {
  const [chatOpen, setChatOpen] = React.useState(false);

  const openChatWindow = () => setChatOpen(true);

  const closeChatWindow = () => setChatOpen(false);

  return (
    <View>
      <PressableIcon onPress={openChatWindow}>
        <ChatIcon />
      </PressableIcon>

      <DefaultModal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        modalVisible={chatOpen}
        setModalVisible={closeChatWindow}
      >
        <ChatWindow />
      </DefaultModal>
    </View>
  );
};
