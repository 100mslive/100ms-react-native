import * as React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
} from 'react-native';
import { useSelector } from 'react-redux';

import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import { RadioIcon } from '../Icons';
import { useShouldGoLive } from '../hooks-util';

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

  const shouldGoLive = useShouldGoLive();

  const disabledJoin = userNameInvalid || loading;

  return (
    <TouchableHighlight
      underlayColor={COLORS.PRIMARY.DARK}
      style={[styles.button, disabledJoin ? styles.disabledButton : null]}
      onPress={onJoin}
      disabled={disabledJoin}
    >
      <>
        {loading ? (
          <ActivityIndicator
            size={'small'}
            color={COLORS.BASE.WHITE}
            style={styles.loader}
          />
        ) : null}

        {shouldGoLive ? (
          <RadioIcon
            style={[
              loading ? styles.hiddenView : null,
              disabledJoin ? styles.disabledIcon : null,
            ]}
          />
        ) : null}

        <Text
          style={[
            styles.text,
            loading ? styles.hiddenView : null,
            disabledJoin ? styles.disabledText : null,
          ]}
        >
          {shouldGoLive ? 'Go Live' : 'Join Now'}
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
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.BASE.WHITE,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 24,
    letterSpacing: 0.5,
    marginHorizontal: 8,
  },
  loader: { position: 'absolute' },
  disabledButton: {
    backgroundColor: COLORS.PRIMARY.DISABLED,
  },
  disabledIcon: {
    tintColor: COLORS.PRIMARY.ON_PRIMARY.LOW,
  },
  disabledText: {
    color: COLORS.PRIMARY.ON_PRIMARY.LOW,
  },
  hiddenView: {
    opacity: 0,
  },
});
