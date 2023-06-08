import React from 'react';
import {useSelector} from 'react-redux';
import {
  HMSHLSPlayerPlaybackCue,
  HMSPeer,
  useHMSHLSPlayerCue,
} from '@100mslive/react-native-hms';

import {Emoticons} from './Emoticon';
import {RootState} from '../redux';

interface EmoticonMessage extends HMSHLSPlayerPlaybackCue {
  payload: {
    type: 'EMOJI_REACTION';
    senderId: string;
    emojiId: string;
    sender: HMSPeer | undefined;
  };
}

export const HLSPlayerEmoticons = () => {
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const [messages, setMessages] = React.useState<EmoticonMessage[]>([]);

  useHMSHLSPlayerCue(cue => {
    if (!hmsInstance) return;

    const payloadStr = cue.payloadval;

    if (typeof payloadStr === 'string') {
      try {
        const payload: Omit<EmoticonMessage['payload'], 'sender'> =
          JSON.parse(payloadStr);
        if (payload.type === 'EMOJI_REACTION') {
          const emojiCue = {
            ...cue,
            payload: {
              ...payload,
              sender: hmsInstance.getPeerFromPeerId(payload.senderId),
            },
          };
          setMessages(prevMessages => [...prevMessages, emojiCue]);
        }
      } catch (error) {
        console.warn('payload is not JSON');
      }
    }
  }, []);

  const handleAnimationComplete = React.useCallback((data: any) => {
    setMessages(prev => prev.filter(message => message !== data));
  }, []);

  return (
    <>
      {messages.map((message, index) => {
        const left = (index % 5) * 60 + 30;
        const uniqueId =
          message.id || message.startDate.getTime() + index.toString();
        return (
          <Emoticons
            key={uniqueId}
            id={uniqueId}
            emoji={getEmojiByString(message.payload.emojiId)}
            text={message.payload.sender?.name || ''}
            bottom={0}
            left={left}
            onAnimationComplete={handleAnimationComplete}
          />
        );
      })}
    </>
  );
};

const emojiMap: Record<string, string> = {
  '+1': '👍',
  '-1': '👎',
  wave: '👋',
  clap: '👏',
  fire: '🔥',
  tada: '🎉',
  heart_eyes: '😍',
  joy: '😂',
  open_mouth: '😮',
  sob: '😭',
};

const getEmojiByString = (emojiCode: string) => emojiMap[emojiCode] || '👍';
