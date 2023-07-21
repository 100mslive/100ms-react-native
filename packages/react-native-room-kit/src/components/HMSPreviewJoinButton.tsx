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

  const disabledJoin = userNameInvalid || loading;

  return (
    <TouchableHighlight
      underlayColor={COLORS.PRIMARY.DARK}
      style={[
        styles.button,
        disabledJoin ? { backgroundColor: COLORS.PRIMARY.DISABLED } : null,
      ]}
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

        <Text
          style={[
            styles.text,
            { opacity: loading ? 0 : undefined },
            disabledJoin ? { color: COLORS.PRIMARY.ON_PRIMARY.LOW } : null,
          ]}
        >
          Join Now
        </Text>
      </>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
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
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.5,
    marginHorizontal: 8,
  },
  loader: { position: 'absolute' },
});
