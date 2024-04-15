import * as React from 'react';
import { StyleSheet, Text } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux';

export interface HLSStreamStartedTimeProps {
  prefix?: React.ReactElement;
}

export const HLSStreamStartedTime: React.FC<HLSStreamStartedTimeProps> = ({
  prefix,
}) => {
  const streamStartedTime = useSelector(
    (state: RootState) =>
      state.hmsStates.room?.hlsStreamingState.variants?.[0]?.startedAt
  );
  const [streamStartedBeforeMillis, setStreamStartedBeforeMillis] =
    React.useState(0);

  React.useEffect(() => {
    if (streamStartedTime) {
      const beforeMilliSecs = Date.now() - streamStartedTime.getTime();

      setStreamStartedBeforeMillis(beforeMilliSecs);

      const intervalId = setInterval(() => {
        setStreamStartedBeforeMillis((secs) => {
          secs += 1000;
          return secs;
        });
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [streamStartedTime]);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularSurfaceMedium: {
      fontFamily: `${typography.font_family}-Regular`,
      color: theme.palette.on_surface_medium,
    },
  }));

  if (!streamStartedTime) {
    return null;
  }

  const { h, min, sec } = msToTime(streamStartedBeforeMillis);

  return (
    <>
      {prefix}

      <Text style={[styles.subtitle, hmsRoomStyles.regularSurfaceMedium]}>
        Started {h > 0 ? `${h} h` : min > 0 ? `${min} min` : `${sec} sec`} ago
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});

function msToTime(duration: number) {
  return {
    ms: duration,
    sec: Math.floor(duration / 1000),
    min: Math.floor(duration / 1000 / 60),
    h: Math.floor(duration / 1000 / 60 / 60),
  };
}
