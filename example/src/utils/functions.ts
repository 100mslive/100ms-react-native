import {
  Platform,
  Dimensions,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {
  HMSPeer,
  HMSTrack,
  HMSTrackType,
  HMSTrackSource,
  HMSLocalPeer,
} from '@100mslive/react-native-hms';

import {PeerTrackNode} from './types';
import {
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import {getRoomLinkDetails} from './getRoomLinkDetails';

export const getMeetingUrl = () =>
  'https://yogi.app.100ms.live/streaming/meeting/nih-bkn-vek';
// 'https://yogi-live.app.100ms.live/streaming/preview/qii-tow-sjq'; // DOUBT: use this URL instead of "nih" one?

export const getMeetingCode = () => 'nih-bkn-vek';

export const getInitials = (name?: String): String => {
  let initials = '';
  if (name) {
    if (name.includes(' ')) {
      const nameArray = name.split(' ');
      if (nameArray[1].length > 0) {
        initials = nameArray[0].substring(0, 1) + nameArray[1].substring(0, 1);
      } else {
        if (nameArray[0].length > 1) {
          initials = nameArray[0].substring(0, 2);
        } else {
          initials = nameArray[0].substring(0, 1);
        }
      }
    } else {
      if (name.length > 1) {
        initials = name.substring(0, 2);
      } else {
        initials = name.substring(0, 1);
      }
    }
  }
  return initials.toUpperCase();
};

export const parseMetadata = (
  metadata?: string,
): {
  isHandRaised?: boolean;
  isBRBOn?: boolean;
} => {
  try {
    if (metadata) {
      const parsedMetadata = JSON.parse(metadata);
      return parsedMetadata;
    }
  } catch (e) {
    console.log(e);
  }
  return {};
};

export const requestExternalStoragePermission = async (): Promise<boolean> => {
  // Function to check the platform
  // If Platform is Android then check for permissions.
  if (Platform.OS === 'ios') {
    return true;
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'Application needs access to your storage to download File',
          buttonPositive: 'true',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Start downloading
        console.log('Storage Permission Granted.');
        return true;
      } else {
        // If permission denied then show alert
        Toast.showWithGravity(
          'Storage Permission Not Granted',
          Toast.LONG,
          Toast.TOP,
        );
        console.log('Storage Permission Not Granted');
      }
    } catch (err) {
      // To handle permission related exception
      console.log('checkPermissionToWriteExternalStroage: ' + err);
    }
  }
  return false;
};

export const callService = async (
  roomID: string,
  success: Function,
  failure: Function,
) => {
  let roomCode;
  let subdomain;
  try {
    if (validateUrl(roomID)) {
      const {roomCode: code, roomDomain: domain} = getRoomLinkDetails(roomID);
      roomCode = code;
      subdomain = domain;

      if (!code || !domain) {
        failure('code, domain not found');
        return;
      }
    } else {
      failure('Invalid room join link');
      return;
    }

    const permissions = await checkPermissions([
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    ]);

    if (permissions) {
      const userId = getRandomUserId(6);
      const isQARoom = subdomain && subdomain.search('.qa-') >= 0;
      success(
        roomCode,
        userId,
        isQARoom
          ? `https://auth-nonprod.100ms.live${Platform.OS === 'ios' ? '/' : ''}`
          : undefined, // Auth Endpoint
        isQARoom ? 'https://qa-init.100ms.live/init' : undefined, // HMSConfig Endpoint
      );
      return;
    } else {
      failure('permission not granted');
      return;
    }
  } catch (error) {
    console.log(error);
    failure('error in call service');
    return;
  }
};

/**
 * @param min minimum range value
 * @param max maximum range value
 * @returns value between min and max, min is inclusive and max is exclusive
 */
export const getRandomNumberInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const getRandomUserId = (length: number) => {
  return Array.from({length}, () => {
    const randomAlphaAsciiCode = getRandomNumberInRange(97, 123); // 97 - 122 is the ascii code range for a-z chars
    const alphaCharacter = String.fromCharCode(randomAlphaAsciiCode);
    return alphaCharacter;
  }).join('');
};

export const getPeerNodes = (
  peerTrackNodes: PeerTrackNode[],
  peerID: string,
): PeerTrackNode[] => {
  const nodes: PeerTrackNode[] = [];
  peerTrackNodes?.map(peerTrackNode => {
    if (peerTrackNode.peer.peerID === peerID) {
      nodes.push(peerTrackNode);
    }
  });
  return nodes;
};

export const getPeerTrackNodes = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  track?: HMSTrack,
): PeerTrackNode[] => {
  const uniqueId =
    peer.peerID +
    (track?.type === HMSTrackType.VIDEO
      ? track?.source || HMSTrackSource.REGULAR
      : HMSTrackSource.REGULAR);
  const nodes: PeerTrackNode[] = [];
  peerTrackNodes?.map(peerTrackNode => {
    if (peerTrackNode.id === uniqueId) {
      nodes.push(peerTrackNode);
    }
  });
  return nodes;
};

export const updatedDegradedFlag = (
  peerTrackNodes: PeerTrackNode[],
  isDegraded: boolean,
): PeerTrackNode[] => {
  return peerTrackNodes?.map(peerTrackNode => {
    return {
      ...peerTrackNode,
      isDegraded,
    };
  });
};

export const updatePeerTrackNodes = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  track: HMSTrack,
): PeerTrackNode[] => {
  const uniqueId =
    peer.peerID +
    (track.source === undefined ? HMSTrackSource.REGULAR : track.source);
  return peerTrackNodes?.map(peerTrackNode => {
    if (peerTrackNode.id === uniqueId) {
      return {
        ...peerTrackNode,
        peer,
        track,
      };
    }
    return peerTrackNode;
  });
};

export const updatePeerNodes = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
): PeerTrackNode[] => {
  return peerTrackNodes?.map(peerTrackNode => {
    if (peerTrackNode.peer.peerID === peer.peerID) {
      return {
        ...peerTrackNode,
        peer,
      };
    }
    return peerTrackNode;
  });
};

export const createPeerTrackNode = (
  peer: HMSPeer,
  track?: HMSTrack,
): PeerTrackNode => {
  if (!track || track.type === HMSTrackType.AUDIO) {
    track = peer.videoTrack;
  }
  let isVideoTrack: boolean = false;
  if (track && track?.type === HMSTrackType.VIDEO) {
    isVideoTrack = true;
  }
  const videoTrack = isVideoTrack ? track : undefined;
  const trackSource = track?.source ?? HMSTrackSource.REGULAR;
  return {
    id: peer.peerID + trackSource,
    peer: peer,
    track: videoTrack,
    isDegraded: false,
  };
};

export const replacePeerTrackNodes = (
  latestPeerTrackNodes: PeerTrackNode[],
  updatedPeerTrackNodes: PeerTrackNode[],
): PeerTrackNode[] => {
  let newPeerTrackNodes = latestPeerTrackNodes;
  updatedPeerTrackNodes.map(updatedPeerTrackNode => {
    newPeerTrackNodes = newPeerTrackNodes.map(latestPeerTrackNode => {
      if (latestPeerTrackNode.id === updatedPeerTrackNode.id) {
        return updatedPeerTrackNode;
      }
      return latestPeerTrackNode;
    });
  });
  return newPeerTrackNodes;
};

export const isPortrait = () => {
  const dim = Dimensions.get('window');
  return dim.height >= dim.width;
};

export const validateUrl = (url?: string): boolean => {
  if (url) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$',
      'i',
    );
    return pattern.test(url);
  }
  return false;
};

export const checkPermissions = async (
  permissions: Array<
    typeof PERMISSIONS.ANDROID[keyof typeof PERMISSIONS.ANDROID]
  >,
): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }

  try {
    const requiredPermissions = permissions.filter(
      permission =>
        permission.toString() !== PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    );

    const results = await requestMultiple(requiredPermissions);

    let allPermissionsGranted = true;
    for (let permission in requiredPermissions) {
      if (!(results[requiredPermissions[permission]] === RESULTS.GRANTED)) {
        allPermissionsGranted = false;
      }
      console.log(
        requiredPermissions[permission],
        ':',
        results[requiredPermissions[permission]],
      );
    }

    // Bluetooth Connect Permission handling
    if (
      permissions.findIndex(
        permission =>
          permission.toString() === PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      ) >= 0
    ) {
      const bleConnectResult = await request(
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      );
      console.log(
        `${PERMISSIONS.ANDROID.BLUETOOTH_CONNECT} : ${bleConnectResult}`,
      );
    }

    return allPermissionsGranted;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const pairData = (
  unGroupedPeerTrackNodes: PeerTrackNode[],
  batch: number,
  localPeer?: HMSLocalPeer,
) => {
  const pairedDataRegular: Array<Array<PeerTrackNode>> = [];
  const pairedDataSource: Array<Array<PeerTrackNode>> = [];
  let groupedPeerTrackNodes: Array<PeerTrackNode> = [];
  let itemsPushed: number = 0;

  unGroupedPeerTrackNodes.map((item: PeerTrackNode) => {
    if (
      item.track?.source !== HMSTrackSource.REGULAR &&
      item.track?.source !== undefined
    ) {
      pairedDataSource.push([item]);
    } else {
      if (itemsPushed === batch) {
        pairedDataRegular.push(groupedPeerTrackNodes);
        groupedPeerTrackNodes = [];
        itemsPushed = 0;
      }
      groupedPeerTrackNodes.push(item);
      itemsPushed++;
    }
  });

  if (groupedPeerTrackNodes.length) {
    pairedDataRegular.push(groupedPeerTrackNodes);
  }

  return [...pairedDataSource, ...pairedDataRegular];
};

export const getDisplayTrackDimensions = (
  peersInPage: number,
  top: number,
  bottom: number,
  orientation: boolean,
) => {
  // window height - (header + footer + top + bottom + padding)

  // Using "extra offset" (i.e. 32) for android as we are getting wrong window height
  const viewHeight =
    Dimensions.get('window').height -
    (50 + 50 + top + bottom + (Platform.OS === 'android' ? 32 : 2));

  let height, width;

  if (orientation) {
    height =
      peersInPage === 1
        ? viewHeight / 1
        : peersInPage === 2
        ? viewHeight / 2
        : peersInPage === 3
        ? viewHeight / 3
        : viewHeight / 2;

    width =
      peersInPage === 1
        ? '100%'
        : peersInPage === 2
        ? '100%'
        : peersInPage === 3
        ? '100%'
        : '50%';
  } else {
    height = viewHeight - (StatusBar.currentHeight || 0);

    width = peersInPage === 1 ? '100%' : '50%';
  }

  return {height, width};
};

// getTrackForPIPView function
// returns first remote peerTrack (regular or screenshare) that it founds
// otherwise returns first valid peerTrack
export const getTrackForPIPView = (pairedPeers: PeerTrackNode[][]) => {
  const peerTracks = pairedPeers.flat();

  // local
  let videoPeerTrackNode = peerTracks[0];

  for (const peerTrack of peerTracks) {
    // Checking if we have "remote" screenshare track
    if (
      peerTrack.peer.isLocal === false &&
      peerTrack.track &&
      peerTrack.track.source !== HMSTrackSource.REGULAR &&
      peerTrack.track.type === HMSTrackType.VIDEO
    ) {
      return peerTrack;
    }

    // remote
    if (peerTrack.peer.isLocal === false) {
      return peerTrack;
    }
  }

  return videoPeerTrackNode;
};

export const getTime = (millisecs: number) => {
  const sec = Math.floor((millisecs / 1000) % 60);

  const min = Math.floor((millisecs / (1000 * 60)) % 60);

  const h = Math.floor((millisecs / (1000 * 60 * 60)) % 24);

  return [h, min, sec];
};
