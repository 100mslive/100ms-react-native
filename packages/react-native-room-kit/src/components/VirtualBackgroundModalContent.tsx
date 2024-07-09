import * as React from 'react';
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { ImageRequireSource } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HMSTrackType, HMSVideoViewMode } from '@100mslive/react-native-hms';
import type { HMSVirtualBackgroundPlugin } from '../modules/videoPluginWrapper';
import { ImagePicker } from '../modules/imagePickerWrapper';

import { BottomSheet } from './BottomSheet';
import {
  AddImageIcon,
  BlurPeopleIcon,
  CloseIcon,
  CrossCircleIcon,
} from '../Icons';
import {
  useDisableAutoPip,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import { VideoView } from './PeerVideoTile/VideoView';
import type { RootState } from '../redux';
import {
  setAutoEnterPipMode,
  setSelectedVirtualBackground,
} from '../redux/actions';
import { useState } from 'react';
import { hexToRgbA } from '../utils/theme';

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
  const autoEnterPipMode = useSelector(
    (state: RootState) => state.app.autoEnterPipMode
  );
  const disableAutoPip = useDisableAutoPip();

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
    loadingContainer: {
      backgroundColor:
        theme.palette.background_default &&
        hexToRgbA(theme.palette.background_default, 0.5),
    },
  }));

  const { primary_bright: primaryBrightColor } = useHMSRoomColorPalette();

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

  const [showLoading, setShowLoading] = useState(false);

  const handlePhotoLibraryPress = async () => {
    if (!ImagePicker) {
      return;
    }
    // Current value of `autoEnterPipMode` state
    let pipModeEnabled = autoEnterPipMode;
    try {
      // If PIP is enabled, disable it
      if (pipModeEnabled) {
        dispatch(setAutoEnterPipMode(false));
        disableAutoPip({});
      }

      const imageLibraryResponse = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      // If PIP was enabled earlier, enable it again
      if (pipModeEnabled) {
        dispatch(setAutoEnterPipMode(true));
      }
      handleImagePickerResponse(imageLibraryResponse);
    } catch (error) {
      console.warn(error);
    }
  };

  // const handleCameraPress = async () => {
  //   if (!ImagePicker) {
  //     return;
  //   }
  //   try {
  //     const cameraResponse = await ImagePicker.launchCamera({
  //       mediaType: 'photo',
  //       cameraType: 'back',
  //     });
  //     handleImagePickerResponse(cameraResponse);
  //   } catch (error) {
  //     console.warn(error);
  //   }
  // };

  const handleImagePickerResponse = (response: any) => {
    if (response.didCancel) {
      throw new Error('User cancelled');
    }
    if (response.errorCode !== undefined) {
      throw new Error(response.errorCode, {
        cause: response.errorMessage,
      });
    }
    const firstAsset = response.assets?.[0];
    if (firstAsset && firstAsset.uri && firstAsset.fileName) {
      handleImagePress({ label: firstAsset.fileName, src: firstAsset });
    }
  };

  const handleBlurEffectPress = async () => {
    try {
      if (videoPlugin) {
        setShowLoading(true);
        if (selectedVirtualBG === null) {
          await videoPlugin.enable();
        }
        await videoPlugin.setBlur(100);
        setShowLoading(false);
        dispatch(setSelectedVirtualBackground('blur'));
      }
    } catch (error) {
      setShowLoading(false);
      console.error('Error setting blur effect', error);
    }
  };

  const handleImagePress = async (asset: {
    label: string;
    src: Parameters<HMSVirtualBackgroundPlugin['setBackground']>[0];
  }) => {
    try {
      if (videoPlugin) {
        setShowLoading(true);
        if (selectedVirtualBG === null) {
          await videoPlugin.enable();
        }
        await videoPlugin.setBackground(asset.src);
        setShowLoading(false);
        dispatch(setSelectedVirtualBackground(asset.label));
      }
    } catch (error) {
      setShowLoading(false);
      console.error('Error setting virtual background', error);
    }
  };

  const showingVideoTrack =
    localPeer &&
    localPeer.videoTrack &&
    localPeer.videoTrack.trackId &&
    localPeer.videoTrack.type === HMSTrackType.VIDEO &&
    !isLocalVideoMuted;

  const backgrounds: Array<
    | {
        icon: React.JSX.Element;
        onPress: () => Promise<void>;
        label: string;
        src?: undefined;
      }
    | {
        icon?: undefined;
        onPress?: undefined;
        label: string;
        src: ImageRequireSource;
      }
  > = [];

  if (ImagePicker) {
    // backgrounds.push({
    //   label: 'Camera',
    //   onPress: handleCameraPress,
    // });
    backgrounds.push({
      icon: <AddImageIcon />,
      label: 'Upload',
      onPress: handlePhotoLibraryPress,
    });
  }

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
          <View style={{ marginHorizontal: 24 }}>
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
                  <CrossCircleIcon size="large" style={{ marginBottom: 8 }} />
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
                  <BlurPeopleIcon style={{ marginBottom: 8 }} />
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

          {backgrounds && backgrounds.length > 0 ? (
            <View style={styles.backgroundContainer}>
              <Text
                style={[
                  hmsRoomStyles.semiBoldSurfaceHigh,
                  styles.normalText,
                  { marginHorizontal: 24 },
                ]}
              >
                Backgrounds
              </Text>

              <View style={[styles.backgroundImages, { marginHorizontal: 18 }]}>
                {backgrounds.map((asset) => {
                  return (
                    <TouchableOpacity
                      key={asset.label}
                      activeOpacity={0.8}
                      onPress={() => {
                        const src = asset.src;
                        if (src) {
                          handleImagePress({ label: asset.label, src });
                        } else if (asset.onPress) {
                          asset.onPress();
                        }
                      }}
                      style={
                        asset.src
                          ? styles.backgroundImageContainer
                          : [
                              styles.effectButton,
                              hmsRoomStyles.effectButton,
                              hmsRoomStyles.inactive,
                              styles.backgroundImageContainer,
                            ]
                      }
                    >
                      {asset.src ? (
                        <Image
                          source={asset.src}
                          style={[
                            styles.backgroundImage,
                            selectedVirtualBG === asset.label
                              ? hmsRoomStyles.active
                              : null,
                          ]}
                        />
                      ) : (
                        <>
                          {asset.icon || null}
                          <Text
                            style={[
                              styles.smallText,
                              hmsRoomStyles.regularSurfaceMedium,
                            ]}
                          >
                            {asset.label}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {showLoading && (
          <View
            style={[styles.loadingContainer, hmsRoomStyles.loadingContainer]}
          >
            <ActivityIndicator size="large" color={primaryBrightColor} />
          </View>
        )}
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
    position: 'relative',
  },
  scrollView: {
    marginTop: 16,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
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
    marginHorizontal: 12,
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
    marginHorizontal: 6,
    marginVertical: 8,
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
