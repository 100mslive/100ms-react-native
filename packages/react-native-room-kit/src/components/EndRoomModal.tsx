import * as React from 'react';

import { ModalTypes } from '../utils/types';
import { BottomSheet } from './BottomSheet';
import { useModalType } from '../hooks-util';
import { EndRoomModalContent } from './EndRoomModalContent';

interface EndRoomModalProps {}

export const EndRoomModal: React.FC<EndRoomModalProps> = () => {
  const { modalVisibleType, handleModalVisibleType } = useModalType();

  const dismissModal = () => handleModalVisibleType(ModalTypes.DEFAULT);

  return (
    <BottomSheet
      dismissModal={dismissModal}
      isVisible={modalVisibleType === ModalTypes.END_ROOM}
      animationOutTiming={700}
    >
      <EndRoomModalContent dismissModal={dismissModal} />
    </BottomSheet>
  );
};
