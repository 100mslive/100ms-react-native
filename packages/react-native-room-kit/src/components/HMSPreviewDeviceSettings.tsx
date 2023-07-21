import * as React from 'react';
import Modal from 'react-native-modal';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HMSUpdateListenerActions,
  HMSAudioDevice,
} from '@100mslive/react-native-hms';

import { ChevronIcon, SettingsIcon, SpeakerIcon } from '../Icons';
import { PressableIcon } from './PressableIcon';
import { COLORS } from '../utils/theme';
import { CloseIcon } from '../Icons';
import { useHMSInstance } from '../hooks-util';
import type { RootState } from '../redux';
import { setRoomLocallyMuted } from '../redux/actions';

enum PreviewModalCloseActions {
  SWITCH_AUDIO_OUTPUT_IOS,
}

export const HMSPreviewDeviceSettings: React.FC = () => {
  const actionAfterModalHide = React.useRef<PreviewModalCloseActions | null>(
    null
  );
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);

  /// VVV
  const [deviceListDropdownOpen, setDeviceListDropdownOpen] =
    React.useState(false);
  const [currentAudioOutputDevice, setCurrentAudioOutputDevice] =
    React.useState<HMSAudioDevice | null>(null);
  const [availableAudioOutputDevices, setAvailableAudioOutputDevices] =
    React.useState<HMSAudioDevice[]>([]);
  /// ^^^

  const roomLocallyMuted = useSelector(
    (state: RootState) => state.hmsStates.roomLocallyMuted
  );
  const debugMode = useSelector((state: RootState) => state.user.debugMode);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      let ignore = false;

      const getCurrentAudioOutputDevice = async () => {
        const device = await hmsInstance.getAudioOutputRouteType();
        if (!ignore) {
          setCurrentAudioOutputDevice(device);
        }
      };

      const getAvailableAudioOutputDevices = async () => {
        const devices = await hmsInstance.getAudioDevicesList();
        if (!ignore) {
          setAvailableAudioOutputDevices(devices);
        }
      };

      getCurrentAudioOutputDevice();
      getAvailableAudioOutputDevices();

      return () => {
        ignore = true;
      };
    }
  }, [hmsInstance]);

  const cleanup = () => {
    setDeviceListDropdownOpen(false);
  };

  const closeModal = () => {
    setSettingsModalVisible(false);
    cleanup();
  };

  // closes modal and no action will be taken after modal has been closed
  const dismissModal = () => {
    actionAfterModalHide.current = null;
    closeModal();
  };

  const handleSpeakerChange = () => {
    if (Platform.OS === 'ios') {
      actionAfterModalHide.current =
        PreviewModalCloseActions.SWITCH_AUDIO_OUTPUT_IOS;
      closeModal();
    } else {
      if (availableAudioOutputDevices.length === 0) {
        hmsInstance
          .getAudioDevicesList()
          .then((devices) => setAvailableAudioOutputDevices(devices)); // TODO(set-state-after-unmount): setting state irrespective of component unmount check
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDeviceListDropdownOpen((prev) => !prev);
    }
  };

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      let ignore = false;
      hmsInstance.setAudioDeviceChangeListener((data: any) => {
        if (!ignore && data) {
          setCurrentAudioOutputDevice(data.device);
        }

        if (debugMode) {
          Toast.showWithGravity(
            `Audio Device Output changed to: ${getDescription(data?.device)}`,
            Toast.LONG,
            Toast.TOP
          );
        }
      });

      return () => {
        ignore = true;

        hmsInstance.removeEventListener(
          HMSUpdateListenerActions.ON_AUDIO_DEVICE_CHANGED
        );
      };
    }
  }, [hmsInstance, debugMode]);

  const handleOnModalClose = () => {
    if (actionAfterModalHide.current === null) {
      return;
    }

    if (
      actionAfterModalHide.current ===
      PreviewModalCloseActions.SWITCH_AUDIO_OUTPUT_IOS
    ) {
      hmsInstance.switchAudioOutputUsingIOSUI();
    }
  };

  const handleMuteRoom = () => {
    hmsInstance.setPlaybackForAllAudio(!roomLocallyMuted);
    dispatch(setRoomLocallyMuted(!roomLocallyMuted));
  };

  const handleSelectAudioDevice = (device: HMSAudioDevice) => {
    hmsInstance.switchAudioOutput(device);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDeviceListDropdownOpen(false);
  };

  return (
    <View>
      <PressableIcon onPress={() => setSettingsModalVisible(true)}>
        <SettingsIcon />
      </PressableIcon>

      <Modal
        isVisible={settingsModalVisible}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropColor={COLORS.BACKGROUND.DIM}
        backdropOpacity={0.3}
        onBackButtonPress={dismissModal}
        onBackdropPress={dismissModal}
        useNativeDriver={true}
        onModalHide={handleOnModalClose}
        useNativeDriverForBackdrop={true}
        hideModalContentWhileAnimating={true}
        // swipeDirection={['up', 'down']}
        // swipe
        style={styles.modal}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Device Settings</Text>

            <TouchableOpacity
              onPress={dismissModal}
              hitSlop={styles.closeIconHitSlop}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.itemLabel}>Speakers</Text>

          <View>
            <TouchableHighlight
              underlayColor={COLORS.SURFACE.DEFAULT}
              style={styles.item}
              onPress={handleSpeakerChange}
            >
              <>
                <View style={styles.itemTextContainer}>
                  <SpeakerIcon muted={false} />

                  <Text style={styles.itemText} numberOfLines={1}>
                    {currentAudioOutputDevice
                      ? getDescription(currentAudioOutputDevice)
                      : 'Switch Audio Output Device'}
                  </Text>
                </View>

                <ChevronIcon
                  direction="down"
                  style={
                    Platform.OS === 'ios'
                      ? styles.downToRightChevronIcon
                      : deviceListDropdownOpen
                      ? styles.downToUpChevronIcon
                      : null
                  }
                />
              </>
            </TouchableHighlight>

            {Platform.OS === 'android' && deviceListDropdownOpen ? (
              <View
                style={{
                  height: 160,
                  marginTop: 8,
                  overflow: 'hidden',
                  borderRadius: 8,
                  backgroundColor: COLORS.SURFACE.DEFAULT,
                }}
              >
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{
                    flex:
                      availableAudioOutputDevices.length === 0 ? 1 : undefined,
                  }}
                >
                  {availableAudioOutputDevices.length === 0 ? (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={styles.headerText}>
                        No other devices available!
                      </Text>
                    </View>
                  ) : (
                    <>
                      {availableAudioOutputDevices.sort().map((device) => (
                        <TouchableOpacity
                          key={device}
                          disabled={device === currentAudioOutputDevice}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor:
                              device === currentAudioOutputDevice
                                ? COLORS.PRIMARY.DARK
                                : undefined,
                          }}
                          onPress={() => handleSelectAudioDevice(device)}
                        >
                          <Text style={styles.itemText}>
                            {getDescription(device)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                </ScrollView>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.item2}
            onPress={handleMuteRoom}
            activeOpacity={0.7}
          >
            <View style={styles.itemTextContainer}>
              <SpeakerIcon muted={roomLocallyMuted} />

              <Text style={styles.itemText} numberOfLines={1}>
                Mute Room
              </Text>
            </View>

            <Switch
              value={roomLocallyMuted}
              thumbColor={COLORS.BASE.WHITE}
              trackColor={{
                true: COLORS.PRIMARY.DEFAULT,
                false: COLORS.SECONDARY.DISABLED,
              }}
              onValueChange={handleMuteRoom}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.SURFACE.DIM,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  divider: {
    marginVertical: 24,
    height: 1,
    backgroundColor: COLORS.BORDER.DEFAULT,
  },
  itemLabel: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
    marginBottom: 8,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.SURFACE.BRIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  item2: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderRadius: 8,
    // backgroundColor: COLORS.SURFACE.BRIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    marginHorizontal: 16,
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  downToRightChevronIcon: {
    transform: [{ rotateZ: '-90deg' }],
  },
  downToUpChevronIcon: {
    transform: [{ rotateZ: '-180deg' }],
  },
});

const getDescription = (ofDevice: HMSAudioDevice) => {
  switch (ofDevice) {
    case HMSAudioDevice.AUTOMATIC:
      return 'Automatic';
    case HMSAudioDevice.BLUETOOTH:
      return 'Bluetooth';
    case HMSAudioDevice.EARPIECE:
      return 'Earpiece';
    case HMSAudioDevice.SPEAKER_PHONE:
      return 'Phone Speaker';
    case HMSAudioDevice.WIRED_HEADSET:
      return 'Wired Headset';
  }
};
