import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { BottomSheet } from '../BottomSheet';
import { useIsAllowedToSendMessage, useModalType } from '../../hooks-util';
import { ModalTypes } from '../../utils/types';
import { ChatMoreActionsView } from './ChatMoreActionsView';
import { useFooterHeight } from '../Footer';
import { useHMSNotificationsHeight } from '../HMSNotifications';
import type { RootState } from '../../redux';

const _ChatMoreActionsModal = () => {
  const { modalVisibleType, handleModalVisibleType } = useModalType();

  const footerHeight = useFooterHeight();
  const notificationsHeight = useHMSNotificationsHeight();
  const isAllowedToSendMessage = useIsAllowedToSendMessage();
  const isMessageInputVisible = useSelector(
    (state: RootState) =>
      state.chatWindow.sendTo !== null && isAllowedToSendMessage
  );

  const dismissModal = () => handleModalVisibleType(ModalTypes.DEFAULT);

  return (
    <BottomSheet
      dismissModal={dismissModal}
      isVisible={modalVisibleType === ModalTypes.CHAT_MORE_ACTIONS}
      backdropOpacity={0.1}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      style={styles.modal}
      containerStyle={[
        styles.contentContainer,
        {
          bottom:
            footerHeight +
            notificationsHeight +
            (isMessageInputVisible ? 92 : 38),
        },
      ]}
    >
      <ChatMoreActionsView onDismiss={dismissModal} />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: undefined,
    position: 'relative',
  },
  contentContainer: {
    paddingBottom: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 8,
  },
});

export const ChatMoreActionsModal = React.memo(_ChatMoreActionsModal);
