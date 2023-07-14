import type { HMSPeer } from '@100mslive/react-native-hms';

export const selectIsHLSViewer = (peer: HMSPeer | null | undefined) =>
  peer?.role?.name?.includes('hls') ?? false;
