import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  HMSAudioTrack,
  HMSLocalPeer,
  HMSRoom,
  HMSVideoTrack,
  HMSVideoViewMode,
} from '@100mslive/react-native-hms';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {RootState} from '../redux';
import {COLORS} from '../utils/theme';
import {CustomButton} from './CustomButton';
import {getInitials} from '../utils/functions';

export const PreviewModal = ({
  room,
  previewTracks,
  join,
  setLoadingButtonState,
  loadingButtonState,
}: {
  room?: HMSRoom;
  previewTracks: {audioTrack: HMSAudioTrack; videoTrack: HMSVideoTrack};
  join: Function;
  setLoadingButtonState: React.Dispatch<React.SetStateAction<boolean>>;
  loadingButtonState: boolean;
}) => {
  const {mirrorLocalVideo, hmsInstance} = useSelector(
    (state: RootState) => state.user,
  );
  const {top, bottom, left, right} = useSafeAreaInsets();

  const [isAudioMute, setIsAudioMute] = useState(
    previewTracks.audioTrack.isMute(),
  );
  const [isVideoMute, setIsVideoMute] = useState(
    previewTracks.videoTrack.isMute(),
  );
  const [previewPeer, setPreviewPeer] = useState<HMSLocalPeer>();
  const [numberOfLines, setNumberOfLines] = useState(true);

  const HmsView = hmsInstance?.HmsView;
  const audioAllowed =
    previewPeer?.role?.publishSettings?.allowed?.includes('audio');
  const videoAllowed =
    previewPeer?.role?.publishSettings?.allowed?.includes('video');

  useEffect(() => {
    const getLocalPeer = async () => {
      setPreviewPeer(await hmsInstance?.getLocalPeer());
    };
    getLocalPeer();
  }, [hmsInstance]);

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        {isVideoMute || !HmsView || !previewTracks.videoTrack.trackId ? (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(previewPeer?.name)}
              </Text>
            </View>
            <Text style={styles.name}>{previewPeer?.name}</Text>
          </View>
        ) : (
          <HmsView
            scaleType={HMSVideoViewMode.ASPECT_FILL}
            style={styles.hmsView}
            trackId={previewTracks.videoTrack.trackId}
            mirror={mirrorLocalVideo}
          />
        )}
      </View>
      <View style={[styles.textContainer, {top: 48 + top}]}>
        <Text style={styles.heading}>Configure Video and Audio</Text>
        <View style={styles.peerList}>
          <TouchableWithoutFeedback
            onPress={() => {
              setNumberOfLines(!numberOfLines);
            }}>
            <Text
              style={styles.collapsibleText}
              numberOfLines={numberOfLines ? 1 : undefined}>
              {room?.peers.map((peer, index) => {
                return (index !== 0 ? ', ' : '') + peer.name;
              })}
            </Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
      <View style={[styles.buttonRow, {bottom: 24 + bottom, left, right}]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconSubContainer}>
            {audioAllowed && (
              <CustomButton
                onPress={() => {
                  setIsAudioMute(!isAudioMute);
                  previewPeer?.localAudioTrack()?.setMute(!isAudioMute);
                }}
                viewStyle={[
                  styles.singleIconContainer,
                  isAudioMute && styles.mute,
                ]}
                LeftIcon={
                  <Feather
                    name={isAudioMute ? 'mic-off' : 'mic'}
                    style={[
                      styles.videoIcon,
                      isAudioMute && styles.muteVideoIcon,
                    ]}
                    size={32}
                  />
                }
              />
            )}
            {videoAllowed && (
              <CustomButton
                onPress={() => {
                  setIsVideoMute(!isVideoMute);
                  previewPeer?.localVideoTrack()?.setMute(!isVideoMute);
                }}
                viewStyle={[
                  styles.singleIconContainer,
                  isVideoMute && styles.mute,
                ]}
                LeftIcon={
                  <Feather
                    name={isVideoMute ? 'video-off' : 'video'}
                    style={[
                      styles.videoIcon,
                      isVideoMute && styles.muteVideoIcon,
                    ]}
                    size={32}
                  />
                }
              />
            )}
          </View>
          <View style={styles.iconSubContainer}>
            {previewPeer && (
              <CustomButton
                onPress={() => {}}
                disabled={true}
                viewStyle={[
                  styles.singleIconContainer,
                  isAudioMute && styles.mute,
                ]}
                LeftIcon={
                  <Image
                    resizeMode="contain"
                    style={styles.image}
                    source={
                      previewPeer?.networkQuality?.downlinkQuality === 0
                        ? require('../../assets/network_0.png')
                        : previewPeer?.networkQuality?.downlinkQuality === 1
                        ? require('../../assets/network_1.png')
                        : previewPeer?.networkQuality?.downlinkQuality === 2
                        ? require('../../assets/network_2.png')
                        : previewPeer?.networkQuality?.downlinkQuality === 3
                        ? require('../../assets/network_3.png')
                        : require('../../assets/network_4.png')
                    }
                  />
                }
              />
            )}
            {/* <CustomButton
              onPress={() => {}}
              viewStyle={styles.singleIconContainer}
              LeftIcon={
                <Feather name="settings" style={styles.videoIcon} size={32} />
              }
            /> */}
          </View>
        </View>
        <CustomButton
          title="Enter Studio ->"
          onPress={() => {
            join();
            setLoadingButtonState(true);
          }}
          loading={loadingButtonState}
          viewStyle={styles.joinButton}
          textStyle={styles.joinButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.WHITE,
  },
  hmsView: {
    height: '100%',
    width: '100%',
  },
  buttonTextContainer: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
  videoIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    height: 32,
  },
  muteVideoIcon: {
    color: COLORS.BORDER.LIGHT,
  },
  image: {
    height: 32,
    width: 32,
  },
  buttonRow: {
    position: 'absolute',
    maxWidth: '100%',
    zIndex: 99,
  },
  textContainer: {
    position: 'absolute',
    width: '80%',
    zIndex: 99,
    alignItems: 'center',
  },
  peerList: {
    top: 16,
    minWidth: '70%',
    maxWidth: '90%',
    backgroundColor: COLORS.OVERLAY,
    borderRadius: 20,
  },
  iconContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  singleIconContainer: {
    padding: 8,
    backgroundColor: COLORS.BORDER.LIGHT,
    borderColor: COLORS.BORDER.LIGHT,
    borderWidth: 1,
    width: 'auto',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  mute: {
    backgroundColor: COLORS.TEXT.HIGH_EMPHASIS,
    borderColor: COLORS.TEXT.HIGH_EMPHASIS,
  },
  joinButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  collapsibleText: {
    paddingVertical: 8,
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.15,
    paddingHorizontal: 16,
  },
  name: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.25,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    paddingTop: 16,
  },
  lowOpacity: {
    opacity: 0.5,
  },
  highOpacity: {
    opacity: 1,
  },
  joinButton: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY.DEFAULT,
    borderRadius: 8,
    width: '50%',
    alignSelf: 'center',
  },
  joinButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
  },
  avatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SURFACE.DEFAULT,
  },
  avatar: {
    width: 144,
    aspectRatio: 1,
    backgroundColor: COLORS.TWIN.PURPLE,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Inter-Medium',
    fontSize: 48,
    lineHeight: 52,
    textAlign: 'center',
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  heading: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.15,
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
});
