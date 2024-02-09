import { useSelector } from 'react-redux';
import { HMSPeer, useHMSHLSPlayerCue } from '@100mslive/react-native-hms';
import type { HMSHLSPlayerPlaybackCue } from '@100mslive/react-native-hms';
import Toast from 'react-native-simple-toast';

import type { RootState } from '../redux';

interface EmoticonMessage extends HMSHLSPlayerPlaybackCue {
  type: string;
  senderId: string;
  emojiId: string;
  sender: HMSPeer | undefined;
}

export const HLSPlayerEmoticons = () => {
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);

  useHMSHLSPlayerCue((cue) => {
    if (!hmsInstance) {
      return;
    }

    const payloadStr = cue.payloadval;

    if (typeof payloadStr === 'string') {
      try {
        const emoticonMessage: EmoticonMessage = JSON.parse(payloadStr);
        if (emoticonMessage.type === 'EMOJI_REACTION') {
          const peer = hmsInstance.getPeerFromPeerId(emoticonMessage.senderId);
          Toast.showWithGravity(
            `${peer?.name} ${getEmojiByString(emoticonMessage.emojiId)}`,
            Toast.LONG,
            Toast.TOP
          );
        }
      } catch (error) {
        const message = `HLSPlayerEmoticons: HLS Cue Payload is not JSON: ${error}`;
        console.log(message);
      }
    }
  }, []);

  return null;
};

const emojiMap: Record<string, string> = {
  '+1': '👍',
  '-1': '👎',
  'wave': '👋',
  'clap': '👏',
  'fire': '🔥',
  'tada': '🎉',
  'heart_eyes': '😍',
  'joy': '😂',
  'open_mouth': '😮',
  'sob': '😭',
};

const getEmojiByString = (emojiCode: string) => emojiMap[emojiCode] || '👍';
