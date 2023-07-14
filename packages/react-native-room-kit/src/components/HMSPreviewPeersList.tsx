import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  HMSPeer,
  HMSPeerUpdate,
  useHMSPeerUpdates,
} from '@100mslive/react-native-hms';

import { COLORS } from '../utils/theme';
import { ParticipantsIcon } from '../Icons';

export interface HMSPreviewPeersListProps {}

export const HMSPreviewPeersList: React.FC<HMSPreviewPeersListProps> = () => {
  const [peerList, setPeerList] = React.useState<HMSPeer[]>([]);

  // TODO: Handle case when peer updates are received before this hook mounts
  // It leads to some already joined peer missing in list
  useHMSPeerUpdates(({ peer, type }) => {
    switch (type) {
      case HMSPeerUpdate.PEER_JOINED:
        setPeerList((prevPeerList) => [...prevPeerList, peer]);
        break;
      case HMSPeerUpdate.PEER_LEFT:
        setPeerList((prevPeerList) =>
          prevPeerList.filter(
            (peerFromList) => peerFromList.peerID !== peer.peerID
          )
        );
        break;

      default:
        break;
    }
  }, []);

  return (
    <View style={styles.container}>
      {peerList.length > 0 ? <ParticipantsIcon /> : null}

      {peerList.length === 0 ? (
        <Text style={[styles.text, styles.textSpacer]}>
          You are the first to join
        </Text>
      ) : peerList.length === 1 ? (
        <Text style={[styles.text, styles.textSpacer]}>
          {peerList[0].name} has joined
        </Text>
      ) : (
        <View style={styles.multiTextContainer}>
          <Text
            style={[styles.text, styles.flexView]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {peerList
              .slice(0, 2)
              .map((peer) => peer.name)
              .join(', ')}
          </Text>

          {peerList.length - 2 > 0 ? (
            <Text style={styles.text}>
              {' '}
              +{peerList.length - 2}{' '}
              {peerList.length - 2 > 1 ? 'others' : 'other'}
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
  flexView: { flex: 1 },
  multiTextContainer: {
    flexDirection: 'row',
    marginHorizontal: 8,
    maxWidth: '70%',
  },
});
