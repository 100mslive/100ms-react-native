import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import {
  TranscriptionState,
  TranscriptionsMode,
} from '@100mslive/react-native-hms';

import {
  useHMSInstance,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import { CloseIcon } from '../Icons';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { TestIds } from '../utils/constants';
import { HMSDangerButton } from './HMSDangerButton';
import { HMSSecondaryButton } from './HMSSecondaryButton';
import type { RootState } from '../redux';
import { addNotification, setShowClosedCaptions } from '../redux/actions';
import { NotificationTypes } from '../types';

export interface CaptionsModalContentProps {
  dismissModal(): void;
}

export const CaptionsModalContent: React.FC<CaptionsModalContentProps> = ({
  dismissModal,
}) => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    semiBoldSurfaceHigh: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    regularSurfaceMedium: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  const { on_surface_high: OnSurfaceHighColor } = useHMSRoomColorPalette();

  const isCCAdmin = useSelector((state: RootState) => {
    const captionPermission =
      state.hmsStates.localPeer?.role?.permissions?.transcriptions?.find(
        (element) => element.mode === TranscriptionsMode.CAPTION
      );
    return captionPermission?.admin || false;
  });

  const ccEnabledForEveryone = useSelector((state: RootState) => {
    return (
      state.hmsStates.room?.transcriptions?.some(
        (transcription) => transcription.state === TranscriptionState.STARTED
      ) || false
    );
  });

  const ccEnabledForSelf = useSelector(
    (state: RootState) => state.app.showClosedCaptions
  );

  const handleClosePress = () => {
    dismissModal();
  };

  const enableCCForEveryone = async () => {
    if (!isCCAdmin) return;
    hmsInstance.startRealTimeTranscription();
    batch(() => {
      dispatch(setShowClosedCaptions(true));
      dispatch(
        addNotification({
          id: 'enable-cc',
          title: 'Enabling Closed Captioning for everyone',
          icon: <ActivityIndicator size={'small'} color={OnSurfaceHighColor} />,
          type: NotificationTypes.INFO,
        })
      );
    });
    dismissModal();
  };

  const disableCCForEveryone = async () => {
    if (!isCCAdmin) return;
    hmsInstance.stopRealTimeTranscription();
    dispatch(
      addNotification({
        id: 'disable-cc',
        title: 'Disabling Closed Captioning for everyone',
        icon: <ActivityIndicator size={'small'} color={OnSurfaceHighColor} />,
        type: NotificationTypes.INFO,
      })
    );
    dismissModal();
  };

  const handleCCForSelf = async () => {
    dispatch(setShowClosedCaptions(!ccEnabledForSelf));
    dismissModal();
  };

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        {ccEnabledForEveryone ? (
          <Text
            testID={TestIds.change_name_modal_heading}
            style={[styles.headerText, hmsRoomStyles.semiBoldSurfaceHigh]}
          >
            Closed Captions (CC)
          </Text>
        ) : (
          <Text
            testID={TestIds.change_name_modal_heading}
            style={[styles.headerText, hmsRoomStyles.semiBoldSurfaceHigh]}
          >
            Enable Closed Captions (CC) {'\n'}for this session?
          </Text>
        )}

        <TouchableOpacity
          testID={TestIds.change_name_modal_close_btn}
          onPress={handleClosePress}
          hitSlop={styles.closeIconHitSlop}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {ccEnabledForEveryone ? (
          <>
            <HMSSecondaryButton
              style={{ marginBottom: 16 }}
              loading={false}
              onPress={handleCCForSelf}
              title={ccEnabledForSelf ? 'Hide for Me' : 'Show for Me'}
            />

            <HMSDangerButton
              loading={false}
              onPress={disableCCForEveryone}
              title="Disable for Everyone"
            />
          </>
        ) : (
          <HMSPrimaryButton
            loading={false}
            onPress={enableCCForEveryone}
            title="Enable for Everyone"
          />
        )}

        <Text style={[styles.subtitle, hmsRoomStyles.regularSurfaceMedium]}>
          This will {ccEnabledForEveryone ? 'disable' : 'enable'} Closed
          Captions for everyone in this room. You can{' '}
          {ccEnabledForEveryone ? 'enable' : 'disable'} it later.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: 24,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  backIcon: {
    marginRight: 8,
  },
  contentContainer: {
    paddingTop: 16,
    marginHorizontal: 24,
  },
  textInput: {
    flex: undefined,
    marginBottom: 16,
  },
});
