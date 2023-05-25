import React, { useRef } from 'react';
import { requireNativeComponent, StyleProp, View } from 'react-native';

type RCTHMSPlayerProps = {
  url?: string;
  style?: StyleProp<{}>;
  onHmsHlsPlaybackEvent(event: any): void;
};

const RCTHMSPlayer = requireNativeComponent<RCTHMSPlayerProps>('HMSPlayer');

export interface HMSPlayerProps {
  url?: string;
  style?: StyleProp<{}>;
  children?: React.ReactElement;
  onPlaybackStart?(): void;
  onPlaybackStop?(): void;
  cueHandler?: React.ReactElement;
}

export const HMSPlayer: React.FC<HMSPlayerProps> = ({
  style,
  url = '',
  children,
}) => {
  const childRef = useRef<null | { handlePlaybackCue?: (data: any) => void }>(
    null
  );

  return (
    <View style={[{ overflow: 'hidden', position: 'relative' }, style]}>
      <RCTHMSPlayer
        url={url}
        style={{ flex: 1 }}
        onHmsHlsPlaybackEvent={(event) => {
          console.log('HMSPlayer onHmsHlsPlaybackEvent -> ', event.nativeEvent);
          childRef.current?.handlePlaybackCue?.(event.nativeEvent.data);
        }}
      />
      {children ? React.cloneElement(children, { ref: childRef }) : null}
    </View>
  );
};

/**
 *
 *

{
  "data": {
    "endDate": "1684778448614",
    "payloadval": "{\"type\":\"EMOJI_REACTION\",\"emojiId\":\"tada\",\"senderId\":\"37b6ded2-08bd-4632-8209-39b423b732e9\"}",
    "startDate": "1684778446614"
  },
  "event": "hmsHlsPlaybackEvent"
}

{
  "type": "EMOJI_REACTION",
  "emojiId": "tada",
  "senderId": "37b6ded2-08bd-4632-8209-39b423b732e9"
}

 */

/**
 * 1. Wrap native ui component in View
 * 2. pass styles passed via props to this wrapper view
 * 3. apply `Stylesheet.absoluteFill` to native ui component
 */
