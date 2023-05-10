import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  HMSVideoViewMode,
  HMSTrackSource,
  HMSVideoTrack,
  HMSPeer,
} from '@100mslive/react-native-hms';
import {useSelector} from 'react-redux';
import type {HMSView} from '@100mslive/react-native-hms';

import {styles} from './styles';

import {getInitials} from '../../utils/functions';
import type {RootState} from '../../redux';

export interface PeerDisplayViewProps {
  isDegraded?: boolean;
  isLocal?: boolean;
  peer: HMSPeer;
  videoTrack?: HMSVideoTrack;
}

const PeerDisplayViewUnmemoized = React.forwardRef<
  typeof HMSView,
  PeerDisplayViewProps
>(({isDegraded, isLocal, peer, videoTrack}, hmsViewRef) => {
  const HmsView = useSelector(
    (state: RootState) => state.user.hmsInstance?.HmsView || null,
  );
  const mirrorCamera = useSelector(
    (state: RootState) => state.app.joinConfig.mirrorCamera,
  );
  const autoSimulcast = useSelector(
    (state: RootState) => state.app.joinConfig.autoSimulcast,
  );

  if (!HmsView) {
    return null;
  }

  return (
    <View style={[peerDisplayViewStyles.container, {justifyContent: 'center'}]}>
      {videoTrack?.isMute() || videoTrack?.trackId === undefined ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(peer.name)}</Text>
          </View>
        </View>
      ) : (
        <HmsView
          ref={hmsViewRef}
          // setZOrderMediaOverlay={miniView}
          trackId={videoTrack?.trackId!}
          autoSimulcast={autoSimulcast}
          mirror={isLocal && mirrorCamera !== undefined ? mirrorCamera : false}
          // scaleType={
          //   HMSVideoViewMode.ASPECT_FIT
          // }
          // style={{
          //   // flex: 1,

          //   // width: 35,
          //   // height: 65,
          //   // maxHeight: '50%',
          //   // flexShrink: 1,
          //   // width: '100%',
          //   // height: '100%',
          //   // height: '1%',
          //   // maxHeight: '100%'
          //   // flex: 1,
          //   // // 864, 540 = 1.65

          //   // // width: 360,
          //   // height: 225,
          //   // maxHeight: 225,

          //   // borderColor: 'pink',
          //   // borderWidth: 10,
          //   // borderStyle: 'dashed',

          //   // height: 480,
          //   // maxHeight: 480,

          //   // height: 131,
          //   // maxHeight: 131,
          //   // flex: 1,
          //   // width: 300,
          //   // height: '51%',
          //   // width: '90%',
          //   // width: 350,
          //   // width: '100%',
          //   // height: '100%',
          //   // minHeight: '50%',
          //   // minWidth: '50%',
          //   // flex: 1,
          //   // width: 348,
          //   // height: 500,
          //   // alignSelf: 'center'
          //   // maxHeight: 169,
          // }}
        />
      )}
    </View>
  );
});

PeerDisplayViewUnmemoized.displayName = 'PeerDisplayViewUnmemoized';

const PeerDisplayView = React.memo(PeerDisplayViewUnmemoized);

PeerDisplayView.displayName = 'PeerDisplayView';

const peerDisplayViewStyles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
});

export default PeerDisplayView;
