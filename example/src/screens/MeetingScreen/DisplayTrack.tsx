import React from 'react';
import {View, Text, StyleProp, ViewStyle} from 'react-native';
import {HMSTrackSource, HMSTrackType} from '@100mslive/react-native-hms';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import type {HMSView} from '@100mslive/react-native-hms';

import {CustomButton} from '../../components';
import {styles} from './styles';
import type {RootState} from '../../redux';
import PeerDisplayView, {PeerDisplayViewProps} from './PeerDisplayView';
import PeerRTCStatsContainer from '../../components/PeerRTCStatsContainer';

interface DisplayTrackProps extends PeerDisplayViewProps {
  videoStyles: StyleProp<ViewStyle>;
  setIsScreenShared: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

// `ref` passed to DisplayTrack component will be passed to PeerDisplayView component
// as HMSView component is being rendered inside PeerDisplayView component
const DisplayTrack = React.forwardRef<typeof HMSView, DisplayTrackProps>(
  (
    {isDegraded, isLocal, peer, videoTrack, videoStyles, setIsScreenShared},
    hmsViewRef,
  ) => {
    // hooks
    const hmsInstance = useSelector(
      (state: RootState) => state.user.hmsInstance,
    );
    const showStatsOnTiles = useSelector(
      (state: RootState) => state.app.joinConfig.showStats,
    );

    // functions
    const onEndScreenSharePress = () => {
      hmsInstance
        ?.stopScreenshare()
        .then(d => {
          console.log('Stop Screenshare Success: ', d);
          setIsScreenShared(false);
        })
        .catch(e => console.log('Stop Screenshare Error: ', e));
    };

    return (
      <View style={videoStyles}>
        {isLocal &&
        videoTrack?.source === HMSTrackSource.SCREEN &&
        videoTrack?.type === HMSTrackType.VIDEO ? (
          <View style={styles.screenshareContainer}>
            <MaterialCommunityIcons
              name="monitor-share"
              style={styles.icon}
              size={48}
            />
            <Text style={styles.screenshareText}>
              You are sharing your screen
            </Text>
            <CustomButton
              title="X   Stop Screenshare"
              onPress={onEndScreenSharePress}
              viewStyle={styles.screenshareButton}
              textStyle={styles.roleChangeModalButtonText}
            />
          </View>
        ) : (
          <PeerDisplayView
            ref={hmsViewRef}
            peer={peer}
            isDegraded={isDegraded}
            isLocal={isLocal}
            videoTrack={videoTrack}
          />
        )}
        {showStatsOnTiles ? (
          <PeerRTCStatsContainer
            trackId={videoTrack?.trackId}
            peerId={peer.peerID}
            trackSource={videoTrack?.source}
          />
      ) : null}
        <View style={styles.peerNameContainer}>
          <Text numberOfLines={2} style={styles.peerName}>
            {videoTrack?.source !== undefined &&
            videoTrack?.source !== HMSTrackSource.REGULAR
              ? `${peer.name}'s ${videoTrack.source}`
              : isLocal
              ? `You (${peer.name})`
              : peer.name}
          </Text>
        </View>
      </View>
    );
  },
);

DisplayTrack.displayName = 'DisplayTrack';

export {DisplayTrack};
