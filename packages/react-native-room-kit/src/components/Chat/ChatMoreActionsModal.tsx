import * as React from 'react';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '../BottomSheet';
import { useModalType } from '../../hooks-util';
import { ModalTypes } from '../../utils/types';
import { ChatMoreActionsView } from './ChatMoreActionsView';
import { useFooterHeight } from '../Footer';
import { useHMSNotificationsHeight } from '../HMSNotifications';

const _ChatMoreActionsModal = () => {
  const { modalVisibleType, handleModalVisibleType } = useModalType();

  const footerHeight = useFooterHeight();
  const notificationsHeight = useHMSNotificationsHeight();

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
        { bottom: footerHeight + notificationsHeight + 92 },
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
