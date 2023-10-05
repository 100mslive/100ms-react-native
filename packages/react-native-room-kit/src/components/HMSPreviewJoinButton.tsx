import * as React from 'react';
import { StyleSheet } from 'react-native';
import { shallowEqual, useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { RadioIcon } from '../Icons';
import {
  useHMSLayoutConfig,
  useHMSRoomStyleSheet,
  useShouldGoLive,
} from '../hooks-util';
import { HMSPrimaryButton } from './HMSPrimaryButton';

export interface HMSPreviewJoinButtonProps {
  onJoin(): void;
  loading: boolean;
}

export const HMSPreviewJoinButton: React.FC<HMSPreviewJoinButtonProps> = ({
  loading,
  onJoin,
}) => {
  const userNameInvalid = useSelector(
    (state: RootState) => state.user.userName.length <= 0
  );

  const joinButtonLabels = useHMSLayoutConfig((layoutConfig) => {
    const joinLayoutConfig =
      layoutConfig?.screens?.preview?.default?.elements?.join_form;

    return {
      joinBtnLabel: joinLayoutConfig?.join_btn_label || 'Join Now',
      goLiveBtnLabel: joinLayoutConfig?.go_live_btn_label || 'Go Live',
    };
  }, shallowEqual);

  const shouldGoLive = useShouldGoLive();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    disabledLiveIcon: {
      tintColor: theme.palette.on_primary_low,
    },
    activeLiveIcon: {
      tintColor: theme.palette.on_primary_high,
    },
  }));

  const disabledJoin = userNameInvalid || loading;

  return (
    <HMSPrimaryButton
      loading={loading}
      onPress={onJoin}
      title={
        shouldGoLive
          ? joinButtonLabels.goLiveBtnLabel
          : joinButtonLabels.joinBtnLabel
      }
      disabled={disabledJoin}
      leftComponent={
        shouldGoLive ? (
          <RadioIcon
            style={
              disabledJoin
                ? hmsRoomStyles.disabledLiveIcon
                : hmsRoomStyles.activeLiveIcon
            }
          />
        ) : null
      }
      style={styles.button}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    marginLeft: 16,
  },
});
