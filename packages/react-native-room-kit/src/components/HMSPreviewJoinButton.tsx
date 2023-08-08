import * as React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
} from 'react-native';
import { shallowEqual, useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { RadioIcon } from '../Icons';
import { useHMSRoomColorPalette, useHMSRoomStyleSheet, useShouldGoLive } from '../hooks-util';

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

  const joinButtonLabels = useSelector((state: RootState) => {
    const layoutConfig = state.hmsStates.layoutConfig;
    const joinLayoutConfig = layoutConfig?.screens?.preview?.default?.elements?.join_form;

    return {
      joinBtnLabel: joinLayoutConfig ? joinLayoutConfig.join_btn_label : 'Join Now',
      goLiveBtnLabel: joinLayoutConfig ? joinLayoutConfig.go_live_btn_label : 'Go Live',
    };
  }, shallowEqual);

  const shouldGoLive = useShouldGoLive();

  const {
    primary_dim: primaryDarkColor,
    on_primary_high: onPrimaryHighColor
  } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.primary_default,
    },
    disabledButton: {
      backgroundColor: theme.palette.primary_disabled,
    },
    disabledIcon: {
      tintColor: theme.palette.on_primary_low,
    },
    buttonText: {
      color: theme.palette.on_primary_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    disabledText: {
      color: theme.palette.on_primary_low,
    },
  }));

  const disabledJoin = userNameInvalid || loading;

  return (
    <TouchableHighlight
      underlayColor={primaryDarkColor}
      style={[
        styles.button,
        hmsRoomStyles.button,
        disabledJoin ? hmsRoomStyles.disabledButton : null
      ]}
      onPress={onJoin}
      disabled={disabledJoin}
    >
      <>
        {loading ? (
          <ActivityIndicator
            size={'small'}
            color={onPrimaryHighColor}
            style={styles.loader}
          />
        ) : null}

        {shouldGoLive ? (
          <RadioIcon
            style={[
              loading ? styles.hiddenView : null,
              disabledJoin ? hmsRoomStyles.disabledIcon : null,
            ]}
          />
        ) : null}

        <Text
          style={[
            styles.text,
            hmsRoomStyles.buttonText,
            loading ? styles.hiddenView : null,
            disabledJoin ? hmsRoomStyles.disabledText : null,
          ]}
        >
          {shouldGoLive ? joinButtonLabels.goLiveBtnLabel : joinButtonLabels.joinBtnLabel}
        </Text>
      </>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    marginHorizontal: 8,
  },
  loader: {
    position: 'absolute'
  },
  hiddenView: {
    opacity: 0,
  },
});
