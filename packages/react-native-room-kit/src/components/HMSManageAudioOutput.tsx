import * as React from 'react';
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
import { useHMSInstance, useHMSRoomStyleSheet } from '../hooks-util';
import type { RootState } from '../redux';
import { BottomSheet } from './BottomSheet';

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

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Medium`,
    },
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    divider: {
      backgroundColor: theme.palette.border_default,
    },
  }));

  return (
    <View>
      <PressableIcon onPress={handleSpeakerChange}>
        {Platform.OS === 'ios' ? (
          <SpeakerIcon muted={false} />
        ) : (
          getIcon(currentAudioOutputDevice || HMSAudioDevice.AUTOMATIC)
        )}
      </PressableIcon>

      <BottomSheet isVisible={settingsModalVisible} dismissModal={dismissModal}>
        <BottomSheet.Header dismissModal={dismissModal} heading='Audio Output' />

        <BottomSheet.Divider />

        <View style={styles.contentContainer}>
          {availableAudioOutputDevices.length === 0 ? (
            <View style={styles.emptyView}>
              <Text style={[styles.itemText, hmsRoomStyles.text]}>
                No other devices available!
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={true}>
              {availableAudioOutputDevices
                .sort(
                  (a, b) => audioDeviceSortOrder[a] - audioDeviceSortOrder[b]
                )
                .map((device, index) => {
                  const isFirst = index === 0;

                  return (
                    <React.Fragment key={device}>
                      {isFirst ? null : <View style={[styles.divider, hmsRoomStyles.divider]} />}

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

                          <Text style={[styles.itemText, hmsRoomStyles.text]}>
                            {getDescription(device, currentAudioOutputDevice)}
                          </Text>
                        </View>

                        {device === currentAudioOutputDevice ? (
                          <CheckIcon />
                        ) : null}
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
            </ScrollView>
          )}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    marginHorizontal: 24,
  },
  itemTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    marginHorizontal: 16,
    fontSize: 14,
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
