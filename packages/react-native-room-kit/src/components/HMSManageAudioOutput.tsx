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
import {
  useHMSInstance,
  useHMSRoomStyleSheet,
  useIsHLSViewer,
} from '../hooks-util';
import type { RootState } from '../redux';
import { BottomSheet } from './BottomSheet';
import { TestIds } from '../utils/constants';
import { useHMSActions } from '../hooks-sdk';

export const HMSManageAudioOutput: React.FC = () => {
  const hmsInstance = useHMSInstance();
  const isHLSViewer = useIsHLSViewer();
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const { setRoomMuteLocally } = useHMSActions();

  const [currentAudioOutputDevice, setCurrentAudioOutputDevice] =
    React.useState<HMSAudioDevice | null>(null);
  const [availableAudioOutputDevices, setAvailableAudioOutputDevices] =
    React.useState<HMSAudioDevice[]>([]);

  const debugMode = useSelector((state: RootState) => state.user.debugMode);
  const roomLocallyMuted = useSelector(
    (state: RootState) => state.hmsStates.roomLocallyMuted
  );

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
    if (Platform.OS === 'android' && availableAudioOutputDevices.length === 0) {
      hmsInstance
        .getAudioDevicesList()
        .then((devices) => setAvailableAudioOutputDevices(devices)); // TODO(set-state-after-unmount): setting state irrespective of component unmount check
    }
    setSettingsModalVisible(true);
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
  const handleSelectAudioDevice = (
    device: HMSAudioDevice | 'mute-audio' | 'ios-audio-device'
  ) => {
    if (device === 'mute-audio') {
      setRoomMuteLocally(true);
    } else {
      if (roomLocallyMuted) {
        setRoomMuteLocally(false);
      }
      if (device === 'ios-audio-device') {
        hmsInstance.switchAudioOutputUsingIOSUI();
      } else {
        hmsInstance.switchAudioOutput(device);
      }
    }
    setSettingsModalVisible(false);
  };

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    text: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  return (
    <View>
      <PressableIcon
        testID={TestIds.manage_audio_output}
        onPress={handleSpeakerChange}
        style={isHLSViewer ? styles.button : null}
      >
        {roomLocallyMuted ? (
          <SpeakerIcon muted={true} />
        ) : Platform.OS === 'ios' ? (
          <SpeakerIcon muted={false} />
        ) : (
          getIcon(currentAudioOutputDevice || HMSAudioDevice.AUTOMATIC)
        )}
      </PressableIcon>

      <BottomSheet isVisible={settingsModalVisible} dismissModal={dismissModal}>
        <BottomSheet.Header
          dismissModal={dismissModal}
          heading="Audio Output"
          headingTestID={TestIds.audio_modal_heading}
          closeIconTestID={TestIds.audio_modal_close_btn}
        />

        <BottomSheet.Divider />

        <View style={styles.contentContainer}>
          {Platform.OS === 'ios' ? (
            <>
              <AudioOutputDevice
                id={'ios-audio-device'}
                hideDivider={true}
                selected={false}
                text={'Auto'}
                icon={<SpeakerIcon muted={false} />}
                onPress={handleSelectAudioDevice}
                checkTestID={TestIds.automatic_audio_device_active}
                textTestID={TestIds.automatic_audio_device_text}
                buttonTestID={TestIds.automatic_audio_device_btn}
              />

              <AudioOutputDevice
                id={'mute-audio'}
                hideDivider={false}
                selected={roomLocallyMuted}
                text={'Mute Audio'}
                icon={<SpeakerIcon muted={true} />}
                onPress={handleSelectAudioDevice}
                checkTestID={TestIds.mute_audio_active}
                textTestID={TestIds.mute_audio_text}
                buttonTestID={TestIds.mute_audio_btn}
              />
            </>
          ) : availableAudioOutputDevices.length === 0 ? (
            <View style={styles.emptyView}>
              <Text
                testID={TestIds.audio_modal_empty_text}
                style={[styles.itemText, hmsRoomStyles.text]}
              >
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
                    <AudioOutputDevice
                      key={device}
                      id={device}
                      hideDivider={isFirst}
                      selected={
                        device === currentAudioOutputDevice && !roomLocallyMuted
                      }
                      checkTestID={activeAudioDeviceTestIds[device]}
                      text={getDescription(device, currentAudioOutputDevice)}
                      textTestID={audioDeviceTextTestIds[device]}
                      icon={getIcon(
                        device === HMSAudioDevice.AUTOMATIC &&
                          currentAudioOutputDevice
                          ? currentAudioOutputDevice
                          : device
                      )}
                      buttonTestID={audioDeviceTestIds[device]}
                      onPress={handleSelectAudioDevice}
                    />
                  );
                })}

              <AudioOutputDevice
                id={'mute-audio'}
                hideDivider={false}
                selected={roomLocallyMuted}
                text={'Mute Audio'}
                icon={<SpeakerIcon muted={true} />}
                onPress={handleSelectAudioDevice}
                checkTestID={TestIds.mute_audio_active}
                textTestID={TestIds.mute_audio_text}
                buttonTestID={TestIds.mute_audio_btn}
              />
            </ScrollView>
          )}
        </View>
      </BottomSheet>
    </View>
  );
};

interface AudioOutputDeviceProps {
  id: HMSAudioDevice | 'mute-audio' | 'ios-audio-device';
  hideDivider: boolean;
  selected: boolean;
  checkTestID: string;
  text: string;
  textTestID: string;
  icon: React.ReactElement;
  buttonTestID: string;
  onPress(selected: HMSAudioDevice | 'mute-audio' | 'ios-audio-device'): void;
}

const AudioOutputDevice: React.FC<AudioOutputDeviceProps> = (props) => {
  const {
    id,
    hideDivider,
    selected,
    checkTestID,
    text,
    textTestID,
    icon,
    buttonTestID,
    onPress,
  } = props;

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme, typography) => ({
      text: {
        color: selected
          ? theme.palette.primary_bright
          : theme.palette.on_surface_high,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
      divider: {
        backgroundColor: theme.palette.border_default,
      },
      checkIcon: {
        tintColor: theme.palette.primary_bright,
      },
    }),
    [selected]
  );

  return (
    <React.Fragment>
      {hideDivider ? null : (
        <View style={[styles.divider, hmsRoomStyles.divider]} />
      )}

      <TouchableOpacity
        testID={buttonTestID}
        disabled={selected}
        style={styles.audioDeviceItem}
        onPress={() => onPress(id)}
      >
        <View style={styles.itemTextWrapper}>
          {icon
            ? React.cloneElement(icon, {
                style: selected ? hmsRoomStyles.checkIcon : null,
              })
            : null}

          <Text
            testID={textTestID}
            style={[styles.itemText, hmsRoomStyles.text]}
          >
            {text}
          </Text>
        </View>

        {selected ? (
          <CheckIcon testID={checkTestID} style={hmsRoomStyles.checkIcon} />
        ) : null}
      </TouchableOpacity>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
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

const audioDeviceTestIds = {
  [HMSAudioDevice.AUTOMATIC]: TestIds.automatic_audio_device_btn,
  [HMSAudioDevice.SPEAKER_PHONE]: TestIds.phone_speaker_audio_device_btn,
  [HMSAudioDevice.WIRED_HEADSET]: TestIds.wired_headset_audio_device_btn,
  [HMSAudioDevice.EARPIECE]: TestIds.earpiece_audio_device_btn,
  [HMSAudioDevice.BLUETOOTH]: TestIds.bluetooth_audio_device_btn,
} as const;

const audioDeviceTextTestIds = {
  [HMSAudioDevice.AUTOMATIC]: TestIds.automatic_audio_device_text,
  [HMSAudioDevice.SPEAKER_PHONE]: TestIds.phone_speaker_audio_device_text,
  [HMSAudioDevice.WIRED_HEADSET]: TestIds.wired_headset_audio_device_text,
  [HMSAudioDevice.EARPIECE]: TestIds.earpiece_audio_device_text,
  [HMSAudioDevice.BLUETOOTH]: TestIds.bluetooth_audio_device_text,
} as const;

const activeAudioDeviceTestIds = {
  [HMSAudioDevice.AUTOMATIC]: TestIds.automatic_audio_device_active,
  [HMSAudioDevice.SPEAKER_PHONE]: TestIds.phone_speaker_audio_device_active,
  [HMSAudioDevice.WIRED_HEADSET]: TestIds.wired_headset_audio_device_active,
  [HMSAudioDevice.EARPIECE]: TestIds.earpiece_audio_device_active,
  [HMSAudioDevice.BLUETOOTH]: TestIds.bluetooth_audio_device_active,
} as const;
