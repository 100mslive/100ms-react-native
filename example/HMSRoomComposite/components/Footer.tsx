import React, {memo, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';

import {ModalTypes} from '../utils/types';
import {COLORS} from '../utils/theme';
import {HMSManageLocalAudio} from './HMSManageLocalAudio';
import {HMSManageLocalVideo} from './HMSManageLocalVideo';
import {HMSChat} from './HMSChat';
import {HMSRoomOptions} from './HMSRoomOptions';
import {useCanPublishAudio, useCanPublishVideo} from '../hooks-sdk';

interface FooterProps {
  modalVisible: ModalTypes;
  setModalVisible(modalType: ModalTypes, delay?: any): void;
}

export const _Footer: React.FC<FooterProps> = ({
  modalVisible,
  setModalVisible,
}) => {
  const canPublishAudio = useCanPublishAudio();
  const canPublishVideo = useCanPublishVideo();

  const footerActionButtons = useMemo(() => {
    const actions = ['chat', 'options'];

    if (canPublishVideo) {
      actions.unshift('video');
    }

    if (canPublishAudio) {
      actions.unshift('audio');
    }

    return actions;
  }, [canPublishAudio, canPublishVideo]);

  return (
    <View style={styles.container}>
      {footerActionButtons.map((actionType, index) => {
        return (
          <View
            key={actionType}
            style={index === 0 ? null : styles.iconWrapper}
          >
            {actionType === 'audio' ? (
              <HMSManageLocalAudio />
            ) : actionType === 'video' ? (
              <HMSManageLocalVideo />
            ) : actionType === 'chat' ? (
              <HMSChat />
            ) : actionType === 'options' ? (
              <HMSRoomOptions
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.BACKGROUND.DIM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginLeft: 24,
  },
});

export const Footer = memo(_Footer);
