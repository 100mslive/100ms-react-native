import * as React from 'react';
import Modal from 'react-native-modal';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import { useSelector } from 'react-redux';
import {
  HMSUpdateListenerActions,
  HMSAudioDevice,
} from '@100mslive/react-native-hms';

import {
  AnswerPhoneIcon,
  BluetoothIcon,
  CheckIcon,
  HeadphonesIcon,
  SpeakerIcon,
  WaveIcon,
} from '../Icons';
import { PressableIcon } from './PressableIcon';
import { COLORS } from '../utils/theme';
import { CloseIcon } from '../Icons';
import { useHMSInstance } from '../hooks-util';
import type { RootState } from '../redux';

export const HMSManageAudioOutput: React.FC = () => {
  const hmsInstance = useHMSInstance();
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);

  const [currentAudioOutputDevice, setCurrentAudioOutputDevice] =
    React.useState<HMSAudioDevice | null>(null);
  const [availableAudioOutputDevices, setAvailableAudioOutputDevices] =
    React.useState<HMSAudioDevice[]>([]);

  const debugMode = useSelector((state: RootState) => state.user.debugMode);

  // Fetch current selected audio device and audio devices list on Android
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

  // closes modal and no action will be taken after modal has been closed
  const dismissModal = () => {
    setSettingsModalVisible(false);
  };

  // Handles showing Modal for changing Audio device
  const handleSpeakerChange = () => {
    if (Platform.OS === 'ios') {
      hmsInstance.switchAudioOutputUsingIOSUI();
    } else {
      if (availableAudioOutputDevices.length === 0) {
        hmsInstance
          .getAudioDevicesList()
          .then((devices) => setAvailableAudioOutputDevices(devices)); // TODO(set-state-after-unmount): setting state irrespective of component unmount check
      }
      setSettingsModalVisible(true);
    }
  };

  // Add audio device change listeners
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      let ignore = false;
      hmsInstance.setAudioDeviceChangeListener((data: any) => {
        if (!ignore && data) {
          setCurrentAudioOutputDevice(data.device);
        }

        if (debugMode) {
          Toast.showWithGravity(
            `Audio Device Output changed to: ${data?.device}`,
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

  // Handle changing selected audio device
  const handleSelectAudioDevice = (device: HMSAudioDevice) => {
    hmsInstance.switchAudioOutput(device);
    setSettingsModalVisible(false);
  };

  return (
    <View>
      <PressableIcon onPress={handleSpeakerChange}>
        {Platform.OS === 'ios' ? (
          <SpeakerIcon muted={false} />
        ) : (
          getIcon(currentAudioOutputDevice || HMSAudioDevice.AUTOMATIC)
        )}
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
        useNativeDriverForBackdrop={true}
        hideModalContentWhileAnimating={true}
        // swipeDirection={['up', 'down']}
        // swipe
        style={styles.modal}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Audio Output</Text>

            <TouchableOpacity
              onPress={dismissModal}
              hitSlop={styles.closeIconHitSlop}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {availableAudioOutputDevices.length === 0 ? (
            <View style={styles.emptyView}>
              <Text style={styles.itemText}>No other devices available!</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={true}>
              {availableAudioOutputDevices
                .sort(
                  (a, b) => audioDeviceSortOrder[a] - audioDeviceSortOrder[b]
                )
                .map((device) => (
                  <React.Fragment key={device}>
                    <View style={styles.divider} />

                    <TouchableOpacity
                      style={styles.audioDeviceItem}
                      onPress={() => handleSelectAudioDevice(device)}
                    >
                      <View style={styles.itemTextWrapper}>
                        {getIcon(
                          device === HMSAudioDevice.AUTOMATIC &&
                            currentAudioOutputDevice
                            ? currentAudioOutputDevice
                            : device
                        )}

                        <Text style={styles.itemText}>
                          {getDescription(device, currentAudioOutputDevice)}
                        </Text>
                      </View>

                      {device === currentAudioOutputDevice ? (
                        <CheckIcon />
                      ) : null}
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
            </ScrollView>
          )}
        </View>
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
    backgroundColor: COLORS.BACKGROUND.DEFAULT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  itemTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    marginHorizontal: 16,
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  emptyView: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioDeviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER.DEFAULT,
  },
});

const getIcon = (ofDevice: HMSAudioDevice) => {
  switch (ofDevice) {
    case HMSAudioDevice.AUTOMATIC:
      return <WaveIcon />;
    case HMSAudioDevice.BLUETOOTH:
      return <BluetoothIcon />;
    case HMSAudioDevice.EARPIECE:
      return <AnswerPhoneIcon />;
    case HMSAudioDevice.SPEAKER_PHONE:
      return <SpeakerIcon muted={false} />;
    case HMSAudioDevice.WIRED_HEADSET:
      return <HeadphonesIcon />;
  }
};

const getDescription = (
  ofDevice: HMSAudioDevice,
  currentDevice: HMSAudioDevice | null
): string => {
  switch (ofDevice) {
    case HMSAudioDevice.AUTOMATIC:
      return currentDevice && currentDevice !== HMSAudioDevice.AUTOMATIC
        ? `Default (${getDescription(currentDevice, currentDevice)})`
        : 'Automatic';
    case HMSAudioDevice.BLUETOOTH:
      return 'Bluetooth Device';
    case HMSAudioDevice.EARPIECE:
      return 'Phone';
    case HMSAudioDevice.SPEAKER_PHONE:
      return 'Speaker';
    case HMSAudioDevice.WIRED_HEADSET:
      return 'Earphone';
  }
};

const audioDeviceSortOrder = {
  [HMSAudioDevice.AUTOMATIC]: 0,
  [HMSAudioDevice.SPEAKER_PHONE]: 1,
  [HMSAudioDevice.WIRED_HEADSET]: 2,
  [HMSAudioDevice.EARPIECE]: 3,
  [HMSAudioDevice.BLUETOOTH]: 4,
} as const;
