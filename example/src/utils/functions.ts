import {Platform, Dimensions, PermissionsAndroid} from 'react-native';
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
} from '@100mslive/react-native-hms';

import {LayoutParams, PeerTrackNode, TrackType} from './types';
import dimension from '../utils/dimension';
import * as services from '../services/index';

export const getThemeColour = () => '#4578e0';

export const getMeetingUrl = () =>
  'https://yogi.app.100ms.live/preview/nih-bkn-vek';

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
) => {
  const pairedData: Array<Array<PeerTrackNode>> = [];
  let groupData: Array<PeerTrackNode> = [];
  let itemsPushed: number = 0;
  data.map((item: PeerTrackNode) => {
    if (item.track?.source !== 'regular') {
      pairedData.push([item]);
    } else {
      if (item.track) {
        if (itemsPushed === batch) {
          pairedData.push(groupData);
          groupData = [];
          itemsPushed = 0;
        }
        groupData.push(item);
        itemsPushed++;
      }
    }
  });
  if (groupData.length) {
    pairedData.push(groupData);
  }
  return pairedData;
};

export const getHmsViewHeight = (
  layout: LayoutParams,
  type: TrackType,
  peersInPage: number,
  top: number,
  bottom: number,
) => {
  const isTab = getDeviceType() === 'Tablet';

  // window height - (header + bottom container + top + bottom + padding) / views in one screen
  const viewHeight =
    type === TrackType.SCREEN
      ? Dimensions.get('window').height -
        (dimension.viewHeight(50) +
          dimension.viewHeight(90) +
          (isTab ? dimension.viewHeight(20) : top + bottom) +
          2)
      : (Dimensions.get('window').height -
          (dimension.viewHeight(50) +
            dimension.viewHeight(90) +
            (isTab ? dimension.viewHeight(20) : top + bottom) +
            2)) /
        2;

  let height =
    peersInPage === 1
      ? viewHeight * 2
      : peersInPage === 2
      ? viewHeight
      : peersInPage === 3
      ? (viewHeight * 2) / 3
      : viewHeight;
  const width =
    peersInPage === 1
      ? '100%'
      : peersInPage === 2
      ? '100%'
      : peersInPage === 3
      ? '100%'
      : '50%';

  if (layout === 'audio' && peersInPage > 4) {
    height = (height * 2) / 3;
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

export const tokenFromLinkService = async (
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

export const updatePeersTrackNodesOnPeerListener = (
  peerTrackNodesRef: React.MutableRefObject<PeerTrackNode[]>,
  peer: HMSPeer,
  type: HMSPeerUpdate,
): PeerTrackNode[] => {
  let newPeerTrackNodes = peerTrackNodesRef.current;
  if (type === HMSPeerUpdate.PEER_JOINED) {
    let alreadyPresent = false;
    const updatePeerTrackNodes = peerTrackNodesRef.current?.map(
      peerTrackNode => {
        if (peerTrackNode.peer.peerID === peer.peerID) {
          alreadyPresent = true;
          return {
            ...peerTrackNode,
            peer,
          };
        }
        return peerTrackNode;
      },
    );
    if (alreadyPresent) {
      newPeerTrackNodes = updatePeerTrackNodes;
    } else {
      const newPeerTrackNode: PeerTrackNode = {
        id: peer.peerID + 'regular',
        peer,
        track: peer?.videoTrack,
      };
      newPeerTrackNodes?.push(newPeerTrackNode);
    }
  } else if (type === HMSPeerUpdate.PEER_LEFT) {
    newPeerTrackNodes = peerTrackNodesRef.current?.filter(peerTrackNode => {
      if (peerTrackNode.peer.peerID === peer.peerID) {
        return false;
      }
      return true;
    });
  } else {
    newPeerTrackNodes = peerTrackNodesRef.current?.map(peerTrackNode => {
      if (peerTrackNode.peer.peerID === peer.peerID) {
        return {
          ...peerTrackNode,
          peer,
          track: peer.videoTrack,
        };
      }
      return peerTrackNode;
    });
  }
  return newPeerTrackNodes;
};

export const updatePeersTrackNodesOnTrackListener = (
  peerTrackNodesRef: React.MutableRefObject<PeerTrackNode[]>,
  track: HMSTrack,
  peer: HMSPeer,
  type: HMSTrackUpdate,
): PeerTrackNode[] => {
  let newPeerTrackNodes = peerTrackNodesRef.current;
  const uniqueId =
    peer.peerID + (track.source === 'regular' ? 'regular' : track.trackId);
  const isVideo = track.type === HMSTrackType.VIDEO;
  if (
    type === HMSTrackUpdate.TRACK_ADDED &&
    !(track.source === 'screen' && peer.isLocal) // remove this condition to show local screenshare
  ) {
    if (isVideo) {
      let peerTrackNodeUpdated = false;
      const updatePeerTrackNodes = peerTrackNodesRef.current?.map(
        peerTrackNode => {
          if (peerTrackNode.id === uniqueId) {
            peerTrackNodeUpdated = true;
            return {
              ...peerTrackNode,
              peer,
              track,
            };
          }
          return peerTrackNode;
        },
      );
      if (peerTrackNodeUpdated) {
        newPeerTrackNodes = updatePeerTrackNodes;
      } else if (!peerTrackNodeUpdated && track.type === HMSTrackType.VIDEO) {
        const newPeerTrackNode: PeerTrackNode = {
          id: uniqueId,
          peer,
          track,
        };
        newPeerTrackNodes?.push(newPeerTrackNode);
      }
    }
  } else if (type === HMSTrackUpdate.TRACK_REMOVED) {
    newPeerTrackNodes = peerTrackNodesRef.current?.filter(peerTrackNode => {
      if (peerTrackNode.id === uniqueId) {
        return false;
      }
      return true;
    });
  } else {
    newPeerTrackNodes = peerTrackNodesRef.current?.map(peerTrackNode => {
      if (isVideo && peerTrackNode.id === uniqueId) {
        return {
          ...peerTrackNode,
          peer,
          track,
        };
      }
      if (!isVideo && peerTrackNode.id === uniqueId) {
        return {
          ...peerTrackNode,
          peer,
        };
      }
      return peerTrackNode;
    });
  }
  return newPeerTrackNodes;
};
