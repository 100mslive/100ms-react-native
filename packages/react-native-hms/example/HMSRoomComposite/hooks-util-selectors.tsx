import type {HMSPeer} from '@100mslive/react-native-hmslive';

export const selectIsHLSViewer = (peer: HMSPeer | null | undefined) =>
  peer?.role?.name?.includes('hls') ?? false;
