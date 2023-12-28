import * as React from 'react';

import { BottomSheet } from '../BottomSheet';
import { useHMSRoomStyleSheet, useModalType } from '../../hooks-util';
import { ModalTypes } from '../../utils/types';
import { MessageOptionsView } from './MessageOptionsView';

const _MessageOptionsBottomSheet = () => {
  const { modalVisibleType, handleModalVisibleType } = useModalType();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    contentContainer: {
      backgroundColor: theme.palette.surface_default,
    },
  }));

  const dismissModal = React.useCallback(
    () => handleModalVisibleType(ModalTypes.DEFAULT),
    [handleModalVisibleType]
  );

  return (
    <BottomSheet
      dismissModal={dismissModal}
      isVisible={modalVisibleType === ModalTypes.MESSAGE_OPTIONS}
      containerStyle={hmsRoomStyles.contentContainer}
    >
      <MessageOptionsView onDismiss={dismissModal} />
    </BottomSheet>
  );
};

export const MessageOptionsBottomSheet = React.memo(_MessageOptionsBottomSheet);
