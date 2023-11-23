import * as React from 'react';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '../BottomSheet';
import { useModalType } from '../../hooks-util';
import { ModalTypes } from '../../utils/types';
import { ChatFilterView } from './ChatFilterView';

const _ChatFilterBottomSheet = () => {
  const { modalVisibleType, handleModalVisibleType } = useModalType();

  const dismissModal = () => handleModalVisibleType(ModalTypes.DEFAULT);

  return (
    <BottomSheet
      dismissModal={dismissModal}
      isVisible={modalVisibleType === ModalTypes.CHAT_FILTER}
      animationOutTiming={400}
      containerStyle={styles.contentContainer}
    >
      <ChatFilterView onDismiss={dismissModal} />
    </BottomSheet>
  );
};

export const ChatFilterBottomSheet = React.memo(_ChatFilterBottomSheet);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 0.7,
  },
});
