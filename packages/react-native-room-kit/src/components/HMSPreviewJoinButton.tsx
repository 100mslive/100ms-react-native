import * as React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
} from 'react-native';

import { COLORS } from '../utils/theme';

export interface HMSPreviewJoinButtonProps {
  onJoin(): void;
  loading: boolean;
}

export const HMSPreviewJoinButton: React.FC<HMSPreviewJoinButtonProps> = ({
  loading,
  onJoin,
}) => {
  return (
    <TouchableHighlight
      underlayColor={COLORS.PRIMARY.DARK}
      style={styles.button}
      onPress={onJoin}
      disabled={loading}
    >
      <>
        {loading ? (
          <ActivityIndicator
            size={'small'}
            color={COLORS.BASE.WHITE}
            style={styles.loader}
          />
        ) : null}

        <Text style={[styles.text, { opacity: loading ? 0 : undefined }]}>
          {'Join'}
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
