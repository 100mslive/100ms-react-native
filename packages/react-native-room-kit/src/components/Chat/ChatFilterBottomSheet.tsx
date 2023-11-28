import * as React from 'react';

import { BottomSheet } from '../BottomSheet';
import { useHMSRoomStyleSheet, useModalType } from '../../hooks-util';
import { ModalTypes } from '../../utils/types';
import { ChatFilterView } from './ChatFilterView';

const _ChatFilterBottomSheet = () => {
  const { modalVisibleType, handleModalVisibleType } = useModalType();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    contentContainer: {
      flex: 0.7,
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
      isVisible={modalVisibleType === ModalTypes.CHAT_FILTER}
      animationOutTiming={400}
      containerStyle={hmsRoomStyles.contentContainer}
    >
      <ChatFilterView onDismiss={dismissModal} />
    </BottomSheet>
  );
};

export const ChatFilterBottomSheet = React.memo(_ChatFilterBottomSheet);
