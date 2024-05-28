import * as React from 'react';
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HMSTrackType, HMSVideoViewMode } from '@100mslive/react-native-hms';

import { BottomSheet } from './BottomSheet';
import { CloseIcon } from '../Icons';
import { useHMSRoomStyleSheet } from '../hooks-util';
import { VideoView } from './PeerVideoTile/VideoView';
import type { RootState } from '../redux';
import { setSelectedVirtualBackground } from '../redux/actions';

export interface VirtualBackgroundModalContentProps {
  dismissModal(): void;
}

export const VirtualBackgroundModalContent: React.FC<
  VirtualBackgroundModalContentProps
> = ({ dismissModal }) => {
  const dispatch = useDispatch();
  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer
  );
  const isLocalVideoMuted = useSelector(
    (state: RootState) => state.hmsStates.isLocalVideoMuted
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    semiBoldSurfaceHigh: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    regularSurfaceMedium: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    effectButton: {
      backgroundColor: theme.palette.surface_bright,
    },
    active: {
      borderColor: theme.palette.primary_default,
    },
    inactive: {
      borderColor: theme.palette.surface_bright,
    },
  }));

  const videoPlugin = useSelector(
    (state: RootState) => state.hmsStates.videoPlugin
  );
  const selectedVirtualBG = useSelector(
    (state: RootState) => state.app.selectedVirtualBackground
  );

  const handleClosePress = () => dismissModal();

  const handleNoEffectPress = async () => {
    if (videoPlugin) {
      await videoPlugin.disable();
      dispatch(setSelectedVirtualBackground(null));
    }
  };

  const handleBlurEffectPress = async () => {
    if (videoPlugin) {
      await videoPlugin.setBlur(100);
      if (selectedVirtualBG === null) {
        await videoPlugin.enable();
      }
      dispatch(setSelectedVirtualBackground('blur'));
    }
  };

  const handleImagePress = async (asset: { label: string; src: any }) => {
    if (videoPlugin) {
      await videoPlugin.setBackground(asset.src);
      if (selectedVirtualBG === null) {
        await videoPlugin.enable();
      }
      dispatch(setSelectedVirtualBackground(asset.label));
    }
  };

  const showingVideoTrack =
    localPeer &&
    localPeer.videoTrack &&
    localPeer.videoTrack.trackId &&
    localPeer.videoTrack.type === HMSTrackType.VIDEO &&
    !isLocalVideoMuted;

  return (
    <View style={styles.flexView}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, hmsRoomStyles.semiBoldSurfaceHigh]}>
          Virtual Background
        </Text>

        <TouchableOpacity
          onPress={handleClosePress}
          hitSlop={styles.closeIconHitSlop}
          style={styles.closeIconButton}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <BottomSheet.Divider style={styles.divider} />

      {/* Content */}
      <View style={styles.flexView}>
        {showingVideoTrack ? (
          <View style={{ height: 280, alignItems: 'center', marginTop: 32 }}>
            <View style={{ width: 166, height: 280 }}>
              <VideoView
                peer={localPeer}
                trackId={localPeer.videoTrack.trackId}
                scaleType={HMSVideoViewMode.ASPECT_FILL}
              />
            </View>
          </View>
        ) : null}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View>
            <Text
              style={[hmsRoomStyles.semiBoldSurfaceHigh, styles.normalText]}
            >
              Effects
            </Text>

            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNoEffectPress}
              >
                <View
                  style={[
                    styles.effectButton,
                    hmsRoomStyles.effectButton,
                    selectedVirtualBG === null
                      ? hmsRoomStyles.active
                      : hmsRoomStyles.inactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.smallText,
                      hmsRoomStyles.regularSurfaceMedium,
                    ]}
                  >
                    No Effect
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.horizontalSpacing}
                onPress={handleBlurEffectPress}
              >
                <View
                  style={[
                    styles.effectButton,
                    hmsRoomStyles.effectButton,
                    selectedVirtualBG === 'blur'
                      ? hmsRoomStyles.active
                      : hmsRoomStyles.inactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.smallText,
                      hmsRoomStyles.regularSurfaceMedium,
                    ]}
                  >
                    Blur
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Blur radius slider here */}
          </View>

          <View style={styles.backgroundContainer}>
            <Text
              style={[hmsRoomStyles.semiBoldSurfaceHigh, styles.normalText]}
            >
              Backgrounds
            </Text>

            <View style={styles.backgroundImages}>
              {[
                {
                  label: 'VB-1',
                  src: require('../assets/VB-1.jpg'),
                },
                {
                  label: 'VB-2',
                  src: require('../assets/VB-2.jpg'),
                },
              ].map((asset) => {
                return (
                  <TouchableOpacity
                    key={asset.label}
                    activeOpacity={0.8}
                    onPress={() => handleImagePress(asset)}
                    style={styles.backgroundImageContainer}
                  >
                    <Image
                      source={asset.src}
                      style={[
                        styles.backgroundImage,
                        selectedVirtualBG === asset.label
                          ? hmsRoomStyles.active
                          : null,
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: 24,
  },
  headerText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  closeIconButton: {
    marginLeft: 16,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  // Divider
  divider: {
    marginVertical: 0,
    marginTop: 16,
  },
  // Content
  flexView: {
    flex: 1,
  },
  scrollView: {
    marginTop: 16,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  normalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  smallText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  effectButton: {
    width: 104,
    height: 88,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  horizontalSpacing: {
    marginHorizontal: 16,
  },
  backgroundContainer: {
    marginTop: 24,
  },
  backgroundImages: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  backgroundImage: {
    width: 104,
    height: 88,
    borderRadius: 8,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backgroundImageContainer: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
});
