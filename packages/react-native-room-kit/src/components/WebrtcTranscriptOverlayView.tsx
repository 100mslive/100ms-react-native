import * as React from 'react';
import { interpolate } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { bottom } = useSafeAreaInsets();
  let timerId = React.useRef<NodeJS.Timeout | null>(null);

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

    let mounted = true;

    const onTranscriptsListener = (data: any) => {
      if (timerId.current != null) {
        clearTimeout(timerId.current);
      }
      setTranscripts(data.transcripts);

      timerId.current = setTimeout(() => {
        if (mounted) {
          setTranscripts(null);
        }
        timerId.current = null;
      }, 4000);
    };

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_TRANSCRIPTS,
      onTranscriptsListener
    );

    return () => {
      mounted = false;
      if (timerId.current !== null) {
        clearTimeout(timerId.current);
        timerId.current = null;
      }
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

  const extraBottomOffset =
    notificationsCount > 0 ? 44 + notificationsCount * 16 : 32;

  const dynamicStyles = {
    top: overlayChatVisible ? 0 : undefined,
    bottom: overlayChatVisible
      ? undefined
      : interpolate(
          offset.value,
          [0, 1],
          [(!isPortrait ? bottom : 0) + extraBottomOffset, extraBottomOffset]
        ),
  };

  if (ccEnabledForEveryone && ccEnabledForSelf && transcripts !== null) {
    return (
      <View
        pointerEvents="box-none"
        style={[styles.absoluteContainer, dynamicStyles]}
      >
        <View style={[styles.container, hmsRoomStyles.container]}>
          {transcripts.map((transcript, idx) => {
            const isFirst = idx === 0;
            return (
              <Text
                key={transcript.transcript}
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
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 1,
  },
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
