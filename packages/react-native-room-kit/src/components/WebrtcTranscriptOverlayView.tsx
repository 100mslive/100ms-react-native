import * as React from 'react';
import { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OverlayContainer } from './OverlayContainer';
import {
  useHMSInstance,
  useHMSRoomStyleSheet,
  useShowChatAndParticipants,
} from '../hooks-util';
import { useIsPortraitOrientation } from '../utils/dimension';
import { COLORS, hexToRgbA } from '../utils/theme';
import type { RootState } from '../redux';
import {
  HMSUpdateListenerActions,
  TranscriptionState,
} from '@100mslive/react-native-hms';
import type { HMSTranscript } from '@100mslive/react-native-hms';

export type WebrtcTranscriptOverlayViewProps = {
  offset: SharedValue<number>;
};

const _WebrtcTranscriptOverlayView: React.FC<
  WebrtcTranscriptOverlayViewProps
> = ({ offset }) => {
  const hmsInstance = useHMSInstance();
  const isPortrait = useIsPortraitOrientation();
  const { overlayChatVisible } = useShowChatAndParticipants();
  const { top, bottom } = useSafeAreaInsets();

  const [transcripts, setTranscripts] =
    React.useState<Array<HMSTranscript> | null>(null);
  const ccEnabledForSelf = useSelector(
    (state: RootState) => state.app.showClosedCaptions
  );
  const ccEnabledForEveryone = useSelector((state: RootState) => {
    return (
      state.hmsStates.room?.transcriptions?.some(
        (transcription) => transcription.state === TranscriptionState.STARTED
      ) || false
    );
  });

  React.useEffect(() => {
    if (!ccEnabledForSelf) return;

    const onTranscriptsListener = (data: any) => {
      setTranscripts(data.transcripts);
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_TRANSCRIPTS,
      onTranscriptsListener
    );

    return () => {
      hmsInstance.removeEventListener(HMSUpdateListenerActions.ON_TRANSCRIPTS);
    };
  }, [ccEnabledForSelf, hmsInstance]);

  const notificationsCount = useSelector((state: RootState) => {
    const isLocalScreenShared = state.hmsStates.isLocalScreenShared;
    return Math.min(
      state.app.notifications.length + (isLocalScreenShared ? 1 : 0),
      3
    );
  });

  const hmsRoomStyles = useHMSRoomStyleSheet(
    (theme, typography) => ({
      container: {
        backgroundColor:
          theme.palette.background_dim &&
          hexToRgbA(theme.palette.background_dim, 0.64),
      },
      regularWhite: {
        color: COLORS.WHITE,
        fontFamily: `${typography.font_family}-Regular`,
      },
      semiBoldWhite: {
        color: COLORS.WHITE,
        fontFamily: `${typography.font_family}-SemiBold`,
      },
    }),
    []
  );

  const overlayedAnimatedStyles = useAnimatedStyle(() => {
    if (overlayChatVisible) {
      return {
        top,
        bottom: undefined,
      };
    }
    const extraBottomOffset =
      notificationsCount > 0 ? 44 + notificationsCount * 16 : 32;
    return {
      top: undefined,
      bottom: interpolate(
        offset.value,
        [0, 1],
        [(!isPortrait ? bottom : 0) + extraBottomOffset, extraBottomOffset]
      ),
    };
  }, [overlayChatVisible, notificationsCount, isPortrait, bottom, top]);

  if (ccEnabledForEveryone && ccEnabledForSelf && transcripts !== null) {
    return (
      <OverlayContainer.Overlay animatedStyle={overlayedAnimatedStyles}>
        <View style={[styles.container, hmsRoomStyles.container]}>
          {transcripts.map((transcript, idx) => {
            const isFirst = idx === 0;
            return (
              <Text
                style={[
                  styles.transcriptText,
                  hmsRoomStyles.regularWhite,
                  isFirst ? null : { marginTop: 8 },
                ]}
              >
                <Text style={hmsRoomStyles.semiBoldWhite}>
                  {transcript.peer.name}:
                </Text>{' '}
                {transcript.transcript}
              </Text>
            );
          })}
        </View>
      </OverlayContainer.Overlay>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 12,
    borderRadius: 8,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
  },
});

export const WebrtcTranscriptOverlayView = React.memo(
  _WebrtcTranscriptOverlayView
);
