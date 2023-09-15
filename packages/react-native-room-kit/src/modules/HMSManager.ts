import { HMSManagerModule, getLogger } from '@100mslive/react-native-hms';
import type { HMSSDK } from '@100mslive/react-native-hms';
import type { Layout } from '@100mslive/types-prebuilt';

import { parseRoomLayout } from './parser';

export async function getRoomLayout(
  hmsInstance: HMSSDK,
  authToken: string,
  endpoint?: string
): Promise<Layout[]> {
  getLogger()?.verbose('#Function getRoomLayout', {
    id: hmsInstance.id,
    authToken,
    endpoint,
  });

  const layoutAPIResponse: string = await HMSManagerModule.getRoomLayout({
    id: hmsInstance.id,
    authToken,
    endpoint,
  });

  return parseRoomLayout(layoutAPIResponse);
}
