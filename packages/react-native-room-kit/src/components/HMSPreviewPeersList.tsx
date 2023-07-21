import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import type { HMSPeer } from '@100mslive/react-native-hms';

import { COLORS } from '../utils/theme';
import { ParticipantsIcon } from '../Icons';
import type { RootState } from '../redux';

export interface HMSPreviewPeersListProps {}

export const HMSPreviewPeersList: React.FC<HMSPreviewPeersListProps> = () => {
  const previewPeersList = useSelector(
    (state: RootState) => state.hmsStates.previewPeersList
  );

  return (
    <View style={styles.container}>
      {previewPeersList.length > 0 ? <ParticipantsIcon /> : null}

      {previewPeersList.length === 0 ? (
        <Text style={[styles.text, styles.textSpacer]}>
          You are the first to join
        </Text>
      ) : previewPeersList.length === 1 ? (
        <Text style={[styles.text, styles.textSpacer]}>
          {previewPeersList[0]!.name} has joined
        </Text>
      ) : (
        <View style={styles.multiTextContainer}>
          <Text
            style={[styles.text, styles.flexView]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {previewPeersList
              .slice(0, 2)
              .map((peer: HMSPeer) => peer.name)
              .join(', ')}
          </Text>

          {previewPeersList.length - 2 > 0 ? (
            <Text style={styles.text}>
              {' '}
              +{previewPeersList.length - 2}{' '}
              {previewPeersList.length - 2 > 1 ? 'others' : 'other'}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE.DEFAULT,
    marginTop: 16,
    marginBottom: 24,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: COLORS.BORDER.DEFAULT,
    borderWidth: 1,
  },
  text: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 24,
  },
  textSpacer: {
    marginHorizontal: 8,
  },
  flexView: {
    flex: 1,
    flexShrink: 1,
  },
  multiTextContainer: {
    flexDirection: 'row',
    marginHorizontal: 8,
    maxWidth: '70%',
  },
});
