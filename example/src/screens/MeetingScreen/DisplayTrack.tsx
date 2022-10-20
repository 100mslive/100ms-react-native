import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {
  HMSVideoViewMode,
  HMSTrackSource,
  HMSTrackType,
  HMSVideoTrack,
} from '@100mslive/react-native-hms';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';

import {CustomButton} from '../../components';
import {getInitials} from '../../utils/functions';
import {styles} from './styles';
import type {RootState} from '../../redux';

type DisplayTrackProps = {
  // layout?: LayoutParams;
  // miniView?: boolean;
  // peerTrackNode: PeerTrackNode;
  isLocal?: boolean;
  peerName: string;
  videoTrack?: HMSVideoTrack;
  videoStyles: any;
};

const DisplayTrack = ({
  // layout,
  // miniView,
  // peerTrackNode,
  isLocal,
  peerName,
  videoTrack,
  videoStyles,
}: DisplayTrackProps) => {
  // hooks
  const {mirrorLocalVideo, hmsInstance} = useSelector(
    (state: RootState) => state.user,
  );

  // useState hook
  const [isDegraded, setIsDegraded] = useState(videoTrack?.isDegraded);

  // constants
  const HmsView = hmsInstance?.HmsView;

  // functions
  const onEndScreenSharePress = () => {
    hmsInstance
      ?.stopScreenshare()
      .then(d => console.log('Stop Screenshare Success: ', d))
      .catch(e => console.log('Stop Screenshare Error: ', e));
  };

  // useEffect hook
  useEffect(() => {
    setIsDegraded(videoTrack?.isDegraded);
  }, [videoTrack?.isDegraded]);

  return HmsView ? (
    <View style={[videoStyles]}>
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
      ) : videoTrack?.isMute() ||
        videoTrack?.trackId === undefined ||
        isDegraded ? (
        // ) : isVideoMute || layout === LayoutParams.AUDIO ? (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(peerName)}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.flex}>
          <HmsView
            // setZOrderMediaOverlay={miniView}
            trackId={videoTrack?.trackId!}
            mirror={
              isLocal && mirrorLocalVideo !== undefined
                ? mirrorLocalVideo
                : false
            }
            scaleType={
              videoTrack?.source !== undefined &&
              videoTrack?.source !== HMSTrackSource.REGULAR
                ? HMSVideoViewMode.ASPECT_FIT
                : HMSVideoViewMode.ASPECT_FILL
            }
            style={
              videoTrack?.source !== undefined &&
              videoTrack?.source !== HMSTrackSource.REGULAR
                ? styles.hmsViewScreen
                : styles.hmsView
            }
          />
          {/* {isDegraded && (
            <View style={styles.degradedContainer}>
              <View style={styles.avatarContainer}>
                <Text style={styles.degradedText}>Degraded</Text>
              </View>
            </View>
          )} */}
        </View>
      )}
      <View style={styles.peerNameContainer}>
        <Text numberOfLines={2} style={styles.peerName}>
          {videoTrack?.source !== undefined &&
          videoTrack?.source !== HMSTrackSource.REGULAR
            ? `${peerName}'s ${videoTrack.source}`
            : isLocal
            ? `You (${peerName})`
            : peerName}
        </Text>
      </View>
    </View>
  ) : (
    <></>
  );
};

export {DisplayTrack};
