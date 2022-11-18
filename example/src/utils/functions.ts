import {
  Platform,
  Dimensions,
  PermissionsAndroid,
  Permission,
  StatusBar,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import {getDeviceType} from 'react-native-device-info';
import Toast from 'react-native-simple-toast';
import {
  HMSPeer,
  HMSPeerUpdate,
  HMSTrack,
  HMSTrackType,
  HMSTrackUpdate,
  HMSTrackSource,
  HMSLocalPeer,
} from '@100mslive/react-native-hms';

import {LayoutParams, PeerTrackNode, SortingType} from './types';
import * as services from '../services/index';
import {PERMISSIONS, requestMultiple, RESULTS} from 'react-native-permissions';

export const getMeetingUrl = () =>
  'https://yogi.app.100ms.live/preview/nih-bkn-vek';

export const getMeetingCode = () => 'nih-bkn-vek';

export const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

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

export const pairDataForFlatlist = (
  data: Array<PeerTrackNode>,
  batch: number,
  sortingType?: SortingType,
  pinnedPeerTrackIds?: String[],
) => {
  let sortedData = data;
  if (sortingType) {
    sortedData = sortPeerTrackNodes(sortedData, sortingType);
  }
  const pairedDataRegular: Array<Array<PeerTrackNode>> = [];
  const pairedDataSource: Array<Array<PeerTrackNode>> = [];
  const pairedDataPinned: Array<Array<PeerTrackNode>> = [];
  let groupData: Array<PeerTrackNode> = [];
  let itemsPushed: number = 0;
  sortedData.map((item: PeerTrackNode) => {
    if (pinnedPeerTrackIds?.includes(item.id)) {
      pairedDataPinned.push([item]);
    } else if (
      item.track?.source !== HMSTrackSource.REGULAR &&
      item.track?.source !== undefined
    ) {
      pairedDataSource.push([item]);
    } else {
      if (itemsPushed === batch) {
        pairedDataRegular.push(groupData);
        groupData = [];
        itemsPushed = 0;
      }
      groupData.push(item);
      itemsPushed++;
    }
  });
  if (groupData.length) {
    pairedDataRegular.push(groupData);
  }
  return [...pairedDataPinned, ...pairedDataSource, ...pairedDataRegular];
};

export const getHmsViewHeight = (
  layout: LayoutParams,
  peersInPage: number,
  top: number,
  bottom: number,
  orientation: boolean,
) => {
  const isTab = getDeviceType() === 'Tablet';

  // window height - (header + top + bottom + padding) / views in one screen
  const viewHeight =
    (Dimensions.get('window').height -
      (50 +
        50 +
        (isTab ? 20 : top + bottom) +
        2 +
        (orientation || Platform.OS === 'ios' ? 0 : 20))) /
    2;

  let height, width;
  if (orientation) {
    height =
      peersInPage === 1
        ? viewHeight * 2
        : peersInPage === 2
        ? viewHeight
        : peersInPage === 3
        ? (viewHeight * 2) / 3
        : viewHeight;
    width =
      peersInPage === 1
        ? '100%'
        : peersInPage === 2
        ? '100%'
        : peersInPage === 3
        ? '100%'
        : '50%';
  } else {
    height = viewHeight * 2;
    width = peersInPage === 1 ? '100%' : '50%';
  }

  if (layout === 'audio' && peersInPage > 4 && orientation) {
    height = (height * 2) / 3;
  } else if (layout === 'audio' && peersInPage > 2 && !orientation) {
    width = '33.33%';
  }

  return {height, width};
};

export const writeFile = async (content: any, fileUrl: string) => {
  await RNFetchBlob.fs
    .writeFile(fileUrl, JSON.stringify(content), 'utf8')
    .then(() => {
      shareFile(fileUrl);
    })
    .catch(e => console.log(e));
};

export const shareFile = async (fileUrl: string) => {
  await Share.open({
    url: Platform.OS === 'android' ? 'file://' + fileUrl : fileUrl,
    type: 'application/json',
  })
    .then(success => console.log(success))
    .catch(e => console.log(e));
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
  userID: string,
  roomID: string,
  success: Function,
  failure: Function,
) => {
  let roomCode;
  let subdomain;
  let response;
  try {
    if (validateUrl(roomID)) {
      const {code, domain} = getRoomIdDetails(roomID);
      roomCode = code;
      subdomain = domain;

      if (code && domain) {
        response = await services.fetchTokenFromLink({
          code,
          subdomain,
          userID,
        });
      } else {
        failure('code, domain not found');
        return;
      }
    } else {
      response = await services.fetchToken({
        userID,
        roomID,
      });
    }

    if (response?.error || !response?.token) {
      failure(response?.msg);
      return;
    }

    const permissions = await checkPermissions([
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
    ]);
    if (permissions) {
      success(
        response?.token,
        userID,
        roomCode,
        subdomain && subdomain.search('.qa-') >= 0
          ? 'https://qa-init.100ms.live/init'
          : undefined,
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

export const callIdService = async (
  userID: string,
  roomID: string,
  joinRoom: Function,
  apiFailed: Function,
) => {
  const response = await services.fetchToken({
    userID,
    roomID,
  });

  if (response.error || !response?.token) {
    apiFailed(response);
  } else {
    joinRoom(response.token, userID);
  }
  return response;
};

export const callLinkService = async (
  code: string,
  subdomain: string,
  userID: string,
  fetchTokenFromLinkSuccess: Function,
  apiFailed: Function,
) => {
  try {
    const response = await services.fetchTokenFromLink({
      code,
      subdomain,
      userID,
    });

    if (response.error || !response?.token) {
      apiFailed(response);
    } else {
      if (subdomain.search('.qa-') >= 0) {
        fetchTokenFromLinkSuccess(
          response.token,
          userID,
          'https://qa-init.100ms.live/init',
        );
      } else {
        fetchTokenFromLinkSuccess(response.token, userID);
      }
    }
  } catch (error) {
    console.log(error, 'error in getToken');
  }
};

export const getRoomIdDetails = (
  roomID: string,
): {code: string; domain: string} => {
  const codeObject = RegExp(/(?!\/)[a-zA-Z\-0-9]*$/g).exec(roomID);

  const domainObject = RegExp(/(https:\/\/)?(?:[a-zA-Z0-9.-])+(?!\\)/).exec(
    roomID,
  );

  let code = '';
  let domain = '';

  if (codeObject && domainObject) {
    code = codeObject[0];
    domain = domainObject[0];
    domain = domain.replace('https://', '');
  }

  return {
    code,
    domain,
  };
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
  track: HMSTrack,
): PeerTrackNode[] => {
  const uniqueId =
    peer.peerID +
    (track.source === undefined ? HMSTrackSource.REGULAR : track.source);
  const nodes: PeerTrackNode[] = [];
  peerTrackNodes?.map(peerTrackNode => {
    if (peerTrackNode.id === uniqueId) {
      nodes.push(peerTrackNode);
    }
  });
  return nodes;
};

export const getPeerTrackNodeFromPairedPeers = (pairedPeers: PeerTrackNode[][], peerToFind: HMSPeer) => {
  const peerTracks = pairedPeers.flat();

  return peerTracks.find(peer => peer.peer.peerID === peerToFind.peerID) || null;
}

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

export const updatePeersTrackNodesOnPeerListener = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  type: HMSPeerUpdate,
): PeerTrackNode[] => {
  const oldPeerTrackNodes = peerTrackNodes;
  if (type === HMSPeerUpdate.PEER_LEFT) {
    return oldPeerTrackNodes?.filter(peerTrackNode => {
      if (peerTrackNode.peer.peerID === peer.peerID) {
        return false;
      }
      return true;
    });
  } else {
    let alreadyPresent = false;
    const updatedPeerTrackNodes = oldPeerTrackNodes?.map(peerTrackNode => {
      if (peerTrackNode.peer.peerID === peer.peerID) {
        alreadyPresent = true;
        return {
          ...peerTrackNode,
          peer,
        };
      }
      return peerTrackNode;
    });
    if (alreadyPresent || !peer?.isLocal) {
      return updatedPeerTrackNodes;
    } else {
      let newPeerTrackNode: PeerTrackNode;
      newPeerTrackNode = {
        id: peer.peerID + HMSTrackSource.REGULAR,
        peer,
        track: peer?.videoTrack,
        isDegraded: false,
      };
      if (peer?.isLocal) {
        return [newPeerTrackNode, ...updatedPeerTrackNodes];
      }
      updatedPeerTrackNodes.push(newPeerTrackNode);
      return updatedPeerTrackNodes;
    }
  }
};

export const updatePeersTrackNodesOnTrackListener = (
  peerTrackNodes: PeerTrackNode[],
  track: HMSTrack,
  peer: HMSPeer,
  type: HMSTrackUpdate,
): PeerTrackNode[] => {
  const oldPeerTrackNodes: PeerTrackNode[] = peerTrackNodes;
  const uniqueId =
    peer.peerID +
    (track.source === undefined ? HMSTrackSource.REGULAR : track.source);
  const isVideo = track.type === HMSTrackType.VIDEO;

  if (type === HMSTrackUpdate.TRACK_REMOVED) {
    if (
      track.source !== HMSTrackSource.REGULAR ||
      peer.role?.name?.includes('hls-')
    ) {
      return oldPeerTrackNodes?.filter(peerTrackNode => {
        if (peerTrackNode.id === uniqueId) {
          return false;
        }
        return true;
      });
    }
    return oldPeerTrackNodes;
  } else {
    let alreadyPresent = false;
    const updatedPeerTrackNodes = oldPeerTrackNodes?.map(peerTrackNode => {
      if (peerTrackNode.id === uniqueId) {
        alreadyPresent = true;
        if (isVideo) {
          return {
            ...peerTrackNode,
            peer,
            track,
          };
        } else {
          return {
            ...peerTrackNode,
            peer,
          };
        }
      }
      return peerTrackNode;
    });
    if (alreadyPresent) {
      return updatedPeerTrackNodes;
    } else {
      let newPeerTrackNode: PeerTrackNode;
      if (isVideo) {
        newPeerTrackNode = {
          id: uniqueId,
          peer,
          track,
          isDegraded: false,
        };
      } else {
        newPeerTrackNode = {
          id: uniqueId,
          peer,
          isDegraded: false,
        };
      }
      if (peer?.isLocal) {
        return [newPeerTrackNode, ...updatedPeerTrackNodes];
      }
      updatedPeerTrackNodes.push(newPeerTrackNode);
      return updatedPeerTrackNodes;
    }
  }
};

const sortPeerTrackNodes = (
  peerTrackNodes: Array<PeerTrackNode>,
  type: SortingType,
): Array<PeerTrackNode> => {
  switch (type) {
    case SortingType.ALPHABETICAL:
      return peerTrackNodes.sort((a, b) =>
        a.peer.name.localeCompare(b.peer.name),
      );
    case SortingType.VIDEO_ON:
      return peerTrackNodes.sort((a, b) => {
        if (a.track?.isMute() === true) {
          return 1;
        }
        if (b.track?.isMute() === true) {
          return -1;
        }
        return 0;
      });
    case SortingType.ROLE_PRIORITY:
      return peerTrackNodes.sort((a, b) => {
        if ((a.peer.role?.priority ?? 0) >= (b.peer.role?.priority ?? 0)) {
          return 1;
        }
        if ((b.peer.role?.priority ?? 0) >= (a.peer.role?.priority ?? 0)) {
          return -1;
        }
        return 0;
      });
    default:
      return peerTrackNodes;
  }
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
  permissions: Array<Permission>,
): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true;
  }
  return await requestMultiple(permissions)
    .then(results => {
      let allPermissionsGranted = true;
      for (let permission in permissions) {
        if (!(results[permissions[permission]] === RESULTS.GRANTED)) {
          allPermissionsGranted = false;
        }
        console.log(
          permissions[permission],
          ':',
          results[permissions[permission]],
        );
      }
      return allPermissionsGranted;
    })
    .catch(error => {
      console.log(error);
      return false;
    });
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
      localPeer?.role?.subscribeSettings?.subscribeTo?.includes(
        item.peer.role?.name || '',
      )
    ) {
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
  const viewHeight =
    Dimensions.get('window').height - (50 + 50 + top + bottom + 2);

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

  if (peerTracks.length <= 0) {
    return null;
  }

  let firstValidTrack = null;
  let firstRemoteTrack = null;

  for (const peerTrack of peerTracks) {
    // If peer is not valid, continue to next item
    if (!peerTrack.peer) {
      continue;
    }

    // Checking if we have "remote" screenshare track
    if (peerTrack.peer.isLocal === false && peerTrack.track && peerTrack.track.source !== 'regular') {
      return peerTrack;
    }
    
    // checking if we have first valid remote peerTrack
    if (firstRemoteTrack === null && peerTrack.peer.isLocal === false) {
      firstRemoteTrack = peerTrack;
    }

    // checking if we have first valid peerTrack
    if (firstValidTrack === null) {
      firstValidTrack = peerTrack;
    }
  }

  return firstRemoteTrack || firstValidTrack;
}
