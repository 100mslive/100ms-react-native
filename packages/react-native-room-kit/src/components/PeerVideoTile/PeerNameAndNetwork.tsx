import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HMSTrackSource } from '@100mslive/react-native-hms';

import { hexToRgbA } from '../../utils/theme';
import {
  AnswerPhoneIcon,
  NetworkQualityIcon,
  ScreenShareIcon,
} from '../../Icons';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import { TestIds } from '../../utils/constants';

export interface PeerNameAndNetworkProps {
  name: string;
  isSIPPeerType: boolean | undefined;
  isLocal: boolean | undefined;
  trackSource: HMSTrackSource | undefined;
  networkQuality: number | undefined;
}

export const PeerNameAndNetwork: React.FC<PeerNameAndNetworkProps> = ({
  name,
  isSIPPeerType,
  isLocal,
  trackSource,
  networkQuality,
}) => {
  const isScreenTrackSource =
    trackSource && trackSource === HMSTrackSource.SCREEN;
  const showTrackSource = trackSource && trackSource !== HMSTrackSource.REGULAR;

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    contentContainer: {
      backgroundColor:
        theme.palette.background_dim &&
        hexToRgbA(theme.palette.background_dim, 0.64),
    },
    name: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer, hmsRoomStyles.contentContainer]}>
        {isScreenTrackSource ? (
          <ScreenShareIcon style={styles.screenShareIcon} />
        ) : isSIPPeerType ? (
          <AnswerPhoneIcon style={styles.phoneIcon} />
        ) : null}

        <Text
          testID={TestIds.tile_user_name}
          style={[styles.name, hmsRoomStyles.name]}
          numberOfLines={1}
          ellipsizeMode={showTrackSource || isSIPPeerType ? 'middle' : 'tail'}
        >
          {name}
          {isLocal && ' (You)'}
          {showTrackSource && `'s ${trackSource}`}
        </Text>

        {isSIPPeerType ? null : (
          <NetworkQualityIcon
            testID={TestIds.tile_network_icon}
            quality={networkQuality}
            style={styles.networkIcon}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 8,
    width: '100%',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8, // left offset
    marginRight: 20 + 4 + 44, // network icon width + network icon left margin + 3 dots button width and horizontal margins
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  screenShareIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  phoneIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  networkIcon: {
    marginLeft: 4,
  },
});
