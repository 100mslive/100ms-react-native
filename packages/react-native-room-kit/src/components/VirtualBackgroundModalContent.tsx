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
import type { ImageRequireSource, ImageURISource } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HMSTrackType, HMSVideoViewMode } from '@100mslive/react-native-hms';
import type { HMSVirtualBackgroundPlugin } from '../modules/videoPluginWrapper';
import { ImagePicker } from '../modules/imagePickerWrapper';
import { selectLayoutConfigForRole } from '../hooks-util-selectors';

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

  // Get layout config for virtual background images
  const layoutConfig = useSelector((state: RootState) => {
    try {
      const currentRole = state.hmsStates.localPeer?.role || null;
      return selectLayoutConfigForRole(
        state.hmsStates.layoutConfig,
        currentRole
      );
    } catch (error) {
      console.warn('[VirtualBackground] Error selecting layout config:', error);
      return null;
    }
  });

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
        console.log(
          '[VirtualBackground] Setting background with asset:',
          JSON.stringify(asset.src, null, 2)
        );

        // Check if it's a remote URL that needs dimensions
        const isRemoteURL =
          typeof asset.src === 'object' &&
          'uri' in asset.src &&
          asset.src.uri &&
          (asset.src.uri.startsWith('http://') ||
            asset.src.uri.startsWith('https://'));

        let imageSource = asset.src;

        // For remote URLs, get dimensions if not already present
        if (isRemoteURL) {
          const src = asset.src as ImageURISource;

          // Check if width and height are already present
          if (!src.width || !src.height) {
            console.log(
              '[VirtualBackground] Getting dimensions for remote URL:',
              src.uri
            );

            try {
              // Use Image.getSize to get dimensions from remote URL
              const dimensions = await new Promise<{
                width: number;
                height: number;
              }>((resolve, reject) => {
                Image.getSize(
                  src.uri!,
                  (width, height) => resolve({ width, height }),
                  (error) => reject(error)
                );
              });

              console.log('[VirtualBackground] Got dimensions:', dimensions);

              // Create new source with dimensions
              imageSource = {
                uri: src.uri,
                width: dimensions.width,
                height: dimensions.height,
              };
            } catch (dimensionError) {
              console.error(
                '[VirtualBackground] Failed to get image dimensions:',
                dimensionError
              );
              // Continue with original source, might still work
            }
          }
        }

        if (selectedVirtualBG === null) {
          await videoPlugin.enable();
        }

        console.log(
          '[VirtualBackground] Calling setBackground with source:',
          JSON.stringify(imageSource, null, 2)
        );
        await videoPlugin.setBackground(imageSource);

        setShowLoading(false);
        dispatch(setSelectedVirtualBackground(asset.label));
        console.log(
          '[VirtualBackground] Successfully set background:',
          asset.label
        );
      }
    } catch (error) {
      setShowLoading(false);
      console.error(
        '[VirtualBackground] Error setting virtual background for:',
        asset.label
      );
      console.error(
        '[VirtualBackground] Asset source:',
        JSON.stringify(asset.src, null, 2)
      );
      console.error('[VirtualBackground] Error details:', error);
    }
  };

  const showingVideoTrack =
    localPeer &&
    localPeer.videoTrack &&
    localPeer.videoTrack.trackId &&
    localPeer.videoTrack.type === HMSTrackType.VIDEO &&
    !isLocalVideoMuted;

  // Memoize backgrounds from layout config
  const configBackgrounds = React.useMemo(() => {
    const bgArray: Array<{
      label: string;
      src: ImageRequireSource | { uri: string };
    }> = [];

    try {
      // Add virtual background images from layout config
      if (!layoutConfig) {
        console.log('[VirtualBackground] No layout config available');
        return bgArray;
      }

      const virtualBackgroundConfig =
        layoutConfig?.screens?.conferencing?.default?.elements
          ?.virtual_background;

      if (!virtualBackgroundConfig) {
        console.log(
          '[VirtualBackground] No virtual background config in layout'
        );
        return bgArray;
      }

      const backgroundMediaList =
        virtualBackgroundConfig?.background_media || [];

      console.log(
        '[VirtualBackground] Found',
        backgroundMediaList.length,
        'background images in config'
      );

      // Process each background image
      backgroundMediaList.forEach((media, index) => {
        if (media?.url) {
          // Extract filename from URL or use a generic label
          const urlParts = media.url.split('/');
          const filename =
            urlParts[urlParts.length - 1] || `Background ${index + 1}`;

          console.log(
            `[VirtualBackground] Adding image ${index + 1}:`,
            media.url
          );

          // Add the image - remote URLs will be handled with Image.getSize on demand
          bgArray.push({
            label: filename,
            src: { uri: media.url },
          });
        }
      });
    } catch (error) {
      console.error(
        '[VirtualBackground] Error processing background images:',
        error
      );
    }

    return bgArray;
  }, [layoutConfig]);

  // Combine config backgrounds with upload button
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
        src: ImageRequireSource | { uri: string };
      }
  > = [
    ...configBackgrounds,
    ...(ImagePicker
      ? [
          {
            icon: <AddImageIcon />,
            label: 'Upload',
            onPress: handlePhotoLibraryPress,
          },
        ]
      : []),
  ];

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
