import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { HMSLocalPeer, HMSRemotePeer } from '@100mslive/react-native-hms';

import { parseMetadata } from '../../utils/functions';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import type { ListItemUI } from '../../hooks-util';
import { HandIcon, NetworkQualityIcon, ThreeDotsIcon } from '../../Icons';
import { Menu } from '../MenuModal';
import { ParticipantsItemOptions } from './ParticipantsItemOptions';

interface ParticipantsItemProps {
  data: ListItemUI<HMSLocalPeer | HMSRemotePeer>;
}

const _ParticipantsItem: React.FC<ParticipantsItemProps> = ({ data }) => {
  const [optionsVisible, setOptionsVisible] = React.useState(false);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      borderColor: theme.palette.border_bright,
    },
    label: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    iconWrapper: {
      backgroundColor: theme.palette.surface_bright,
    },
    menu: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.border_bright,
    },
  }));

  const showOptions = () => setOptionsVisible(true);

  const hideOptions = () => setOptionsVisible(false);

  const hide3Dots = true;

  const isLast = data.type === 'LAST_ITEM';

  const peer = data.data;
  const isHandRaised = parseMetadata(peer.metadata).isHandRaised;

  return (
    <View
      style={[
        styles.container,
        isLast ? styles.lastItemContainer : null,
        hmsRoomStyles.container,
      ]}
    >
      <Text style={[styles.label, hmsRoomStyles.label]}>{data.data.name}</Text>

      <View style={styles.controls}>
        {isHandRaised ? (
          <View
            style={[
              styles.control,
              styles.iconWrapper,
              hmsRoomStyles.iconWrapper,
            ]}
          >
            <HandIcon style={styles.handIcon} />
          </View>
        ) : null}

        {peer.networkQuality &&
        peer.networkQuality.downlinkQuality >= 0 &&
        peer.networkQuality.downlinkQuality < 4 ? (
          <View
            style={[
              styles.control,
              styles.iconWrapper,
              hmsRoomStyles.iconWrapper,
            ]}
          >
            <NetworkQualityIcon
              quality={peer.networkQuality?.downlinkQuality}
              style={styles.networkIcon}
            />
          </View>
        ) : null}

        {hide3Dots ? null : (
          <Menu
            visible={optionsVisible}
            onRequestClose={hideOptions}
            anchor={
              <TouchableOpacity style={styles.control} onPress={showOptions}>
                <ThreeDotsIcon stack="vertical" />
              </TouchableOpacity>
            }
            style={{ ...styles.menu, ...hmsRoomStyles.menu }}
          >
            <ParticipantsItemOptions peer={peer} />
          </Menu>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  lastItemContainer: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  controls: {
    flexDirection: 'row',
  },
  control: {
    marginLeft: 16,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handIcon: {
    width: 18.75,
    height: 18.75,
  },
  networkIcon: {
    width: 16,
    height: 16,
  },
  menu: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
});

export const ParticipantsItem = React.memo(_ParticipantsItem);
