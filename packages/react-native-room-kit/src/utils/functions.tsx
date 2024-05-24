import {
  Platform,
  Dimensions,
  PermissionsAndroid,
  StatusBar,
  Text,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {
  HMSPeer,
  HMSTrack,
  HMSTrackType,
  HMSTrackSource,
  HMSVideoTrack,
  HMSRole,
  HMSPollQuestionType,
} from '@100mslive/react-native-hms';
import type {
  HMSPoll,
  HMSPollQuestionAnswer,
  HMSPollQuestionResponse,
  HMSPollQuestion,
  HMSPollQuestionOption,
} from '@100mslive/react-native-hms';

import type { PeerTrackNode } from './types';
import * as React from 'react';

export const getMeetingUrl = () =>
  'https://yogi.app.100ms.live/streaming/meeting/nih-bkn-vek';
// 'https://yogi-live.app.100ms.live/streaming/preview/qii-tow-sjq'; // DOUBT: use this URL instead of "nih" one?

export const getMeetingCode = () => 'nih-bkn-vek';

export const getInitials = (name?: String): String => {
  name = name?.trim();

  let initials = '';

  if (name && name.length > 0) {
    const nameArray = name.split(' ');
    const firstName = nameArray.length > 0 ? nameArray[0] : null;
    const secondName = nameArray.length > 1 ? nameArray[1] : null;

    if (firstName && secondName) {
      initials = firstName.substring(0, 1) + secondName.substring(0, 1);
    } else if (firstName) {
      initials = firstName.substring(0, firstName.length > 1 ? 2 : 1);
    }
  }

  return initials.toUpperCase();
};

export const parseMetadata = (
  metadata?: string
): {
  isBRBOn?: boolean;
  prevRole?: string;
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
        'android.permission.WRITE_EXTERNAL_STORAGE',
        {
          title: 'Storage Permission Required',
          message: 'Application needs access to your storage to download File',
          buttonPositive: 'true',
        }
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
          Toast.TOP
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

/**
 * @param min minimum range value
 * @param max maximum range value
 * @returns value between min and max, min is inclusive and max is exclusive
 */
export const getRandomNumberInRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const getRandomUserId = (length: number) => {
  return Array.from({ length }, () => {
    const randomAlphaAsciiCode = getRandomNumberInRange(97, 123); // 97 - 122 is the ascii code range for a-z chars
    const alphaCharacter = String.fromCharCode(randomAlphaAsciiCode);
    return alphaCharacter;
  }).join('');
};

export const getPeerNodes = (
  peerTrackNodes: PeerTrackNode[],
  peerID: string
): PeerTrackNode[] => {
  const nodes: PeerTrackNode[] = [];
  peerTrackNodes?.map((peerTrackNode) => {
    if (peerTrackNode.peer.peerID === peerID) {
      nodes.push(peerTrackNode);
    }
  });
  return nodes;
};

export const getPeerTrackNodes = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  track?: HMSTrack
): PeerTrackNode[] => {
  const uniqueId =
    peer.peerID +
    (track?.type === HMSTrackType.VIDEO
      ? track?.source || HMSTrackSource.REGULAR
      : HMSTrackSource.REGULAR);
  const nodes: PeerTrackNode[] = [];
  peerTrackNodes?.map((peerTrackNode) => {
    if (peerTrackNode.id === uniqueId) {
      nodes.push(peerTrackNode);
    }
  });
  return nodes;
};

export const updatedDegradedFlag = (
  peerTrackNodes: PeerTrackNode[],
  isDegraded: boolean
): PeerTrackNode[] => {
  return peerTrackNodes?.map((peerTrackNode) => {
    return {
      ...peerTrackNode,
      isDegraded,
    };
  });
};

export const updatePeerTrackNodes = (
  peerTrackNodes: PeerTrackNode[],
  peer: HMSPeer,
  track: HMSTrack
): PeerTrackNode[] => {
  const uniqueId =
    peer.peerID +
    (track.source === undefined ? HMSTrackSource.REGULAR : track.source);
  return peerTrackNodes?.map((peerTrackNode) => {
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
  peer: HMSPeer
): PeerTrackNode[] => {
  return peerTrackNodes?.map((peerTrackNode) => {
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
  track?: HMSTrack
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
  updatedPeerTrackNodes: PeerTrackNode[]
): PeerTrackNode[] => {
  let newPeerTrackNodes = latestPeerTrackNodes;
  updatedPeerTrackNodes.map((updatedPeerTrackNode) => {
    newPeerTrackNodes = newPeerTrackNodes.map((latestPeerTrackNode) => {
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
      'i'
    );
    return pattern.test(url);
  }
  return false;
};

export const pairData = (
  unGroupedPeerTrackNodes: PeerTrackNode[],
  batch: number,
  spotlightVideoTrackId?: string | null
) => {
  const spotlightNode: Array<Array<PeerTrackNode>> = [];
  const pairedDataRegular: Array<Array<PeerTrackNode>> = [];
  const pairedDataSource: Array<Array<PeerTrackNode>> = [];
  let groupedPeerTrackNodes: Array<PeerTrackNode> = [];
  let itemsPushed: number = 0;

  unGroupedPeerTrackNodes.map((item: PeerTrackNode) => {
    const { onSpotlight } = isTileOnSpotlight(spotlightVideoTrackId, {
      tileVideoTrack: item.track,
      peerRegularAudioTrack: item.peer.audioTrack,
      peerAuxTracks: item.peer.auxiliaryTracks,
    });

    if (onSpotlight) {
      spotlightNode.push([item]);
    } else if (
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

  return [...spotlightNode, ...pairedDataSource, ...pairedDataRegular];
};

export const isTileOnSpotlight = (
  spotlightTrackId: string | undefined | null,
  peerTracks: {
    tileVideoTrack?: HMSVideoTrack;
    peerRegularAudioTrack?: HMSTrack;
    peerAuxTracks?: HMSTrack[];
  }
) => {
  const trackSource =
    peerTracks.tileVideoTrack?.source || HMSTrackSource.REGULAR;

  const videoTrackId = peerTracks.tileVideoTrack?.trackId;

  const audioTrackId =
    trackSource === HMSTrackSource.REGULAR
      ? peerTracks.peerRegularAudioTrack?.trackId
      : peerTracks.peerAuxTracks?.find(
          (auxiliaryTrack) =>
            auxiliaryTrack.source === trackSource &&
            auxiliaryTrack.type === HMSTrackType.AUDIO
        )?.trackId;

  return {
    onSpotlight: spotlightTrackId
      ? spotlightTrackId === audioTrackId || spotlightTrackId === videoTrackId
      : false,
    tileVideoTrackId: videoTrackId,
    tileAudioTrackId: audioTrackId,
  };
};

export const getDisplayTrackDimensions = (
  peersInPage: number,
  top: number,
  bottom: number,
  isPortraitOrientation: boolean
) => {
  // window height - (header + footer + top + bottom + padding)

  // Using "extra offset" (i.e. 32) for android as we are getting wrong window height
  const viewHeight =
    Dimensions.get('window').height -
    (50 + 50 + top + bottom + (Platform.OS === 'android' ? 32 : 2));

  let height, width;

  if (isPortraitOrientation) {
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

  return { height, width };
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

export const getTime = (millisecs: number): [number, number, number] => {
  const sec = Math.floor((millisecs / 1000) % 60);

  const min = Math.floor((millisecs / (1000 * 60)) % 60);

  const h = Math.floor((millisecs / (1000 * 60 * 60)) % 24);

  return [h, min, sec];
};

export const getTimeStringin12HourFormat = (time: Date) => {
  let hours = time.getHours();
  const minutes = time.getMinutes();
  const notation = hours / 12 > 1 ? ' PM' : ' AM';
  hours = hours % 12;
  return (
    (hours < 10 ? '0' + hours : hours) +
    ':' +
    (minutes < 10 ? '0' + minutes : minutes) +
    notation
  );
};

/**
 * @param totalNumber total number of tiles
 * @returns list of pairs that can be made from total number of tiles
 *
 * Example: If totalNumber is `5`, then output will be = `[ [0, 1], [2, 3], [4] ]`;
 */
export function groupIntoPairs(totalNumber: number) {
  const pairs = [];
  for (let i = 0; i < totalNumber; i += 2) {
    if (i + 1 < totalNumber) {
      pairs.push([i, i + 1]);
    } else {
      pairs.push([i]);
    }
  }
  return pairs;
}

/**
 * @param list array of items
 * @param fill boolean to fill the last triplet with `undefined` if it has less than 3 items
 * @returns list of triplets
 *
 * Example: If list is `[a, b, c, d]`, then output will be `[ [a, b, c], [d] ]`
 */
export function groupIntoTriplets<T>(list: T[], fill?: boolean) {
  const pairs = [];
  const listLength = list.length;

  for (let i = 0; i < listLength; i += 3) {
    if (i + 2 < listLength) {
      pairs.push([list[i], list[i + 1], list[i + 2]]);
    } else if (i + 1 < listLength) {
      const t = [list[i], list[i + 1]];
      if (fill) {
        t.push(undefined);
      }
      pairs.push(t);
    } else {
      const t = [list[i]];
      if (fill) {
        t.splice(1, 0, undefined, undefined);
      }
      pairs.push(t);
    }
  }
  return pairs;
}

export const isParticipantHostOrBroadcaster = (role: HMSRole): boolean => {
  const allowed = role.publishSettings?.allowed;
  const canChangeRole = role.permissions?.changeRole;

  return Boolean(allowed && allowed.length > 0 && canChangeRole);
};

export const visiblePollsSelector = (
  polls: HMSPoll[],
  isHLSViewer: boolean,
  hlsCuedPollIds: HMSPoll['pollId'][]
) => {
  return polls.filter((poll) =>
    isHLSViewer ? hlsCuedPollIds.includes(poll.pollId) : true
  );
};

export function checkIsSelected(
  pollQuestion: HMSPollQuestion,
  option: HMSPollQuestionOption,
  selectedOptions: number | number[] | null
) {
  return pollQuestion.myResponses.length > 0
    ? pollQuestion.type === HMSPollQuestionType.singleChoice
      ? !!pollQuestion.myResponses.find((r) => r.option === option.index)
      : !!pollQuestion.myResponses.find((r) =>
          r.options ? r.options.includes(option.index) : false
        )
    : Array.isArray(selectedOptions)
      ? selectedOptions.includes(option.index)
      : selectedOptions === option.index;
}

export function checkIsCorrectAnswer(
  questionType: HMSPollQuestionType,
  myResponses: HMSPollQuestionResponse[] | undefined,
  answer: HMSPollQuestionAnswer | undefined
) {
  if (!myResponses || myResponses.length < 0 || !answer) {
    return false;
  }
  const correctAnswer =
    questionType === HMSPollQuestionType.multipleChoice
      ? answer.options
      : answer.option;

  if (correctAnswer === undefined) {
    return false;
  }
  if (Array.isArray(correctAnswer)) {
    return myResponses.every(
      (r) =>
        r.options &&
        r.options.length === correctAnswer.length &&
        r.options.every((o) => correctAnswer.includes(o))
    );
  }
  return myResponses.every((r) => r.option === correctAnswer);
}

export function checkIsCorrectOption(
  questionType: HMSPollQuestionType,
  option: HMSPollQuestionOption,
  answer: HMSPollQuestionAnswer | undefined
) {
  if (!answer) {
    return false;
  }
  const correctAnswer =
    questionType === HMSPollQuestionType.multipleChoice
      ? answer.options
      : answer.option;

  if (correctAnswer === undefined) {
    return false;
  }
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.includes(option.index);
  }
  return option.index === correctAnswer;
}

export function getLabelFromPollQuestionType(
  type: HMSPollQuestionType
): string {
  switch (type) {
    case HMSPollQuestionType.singleChoice:
      return 'Single Choice';
    case HMSPollQuestionType.multipleChoice:
      return 'Multiple Choice';
    case HMSPollQuestionType.longAnswer:
      return 'Long Answer';
    case HMSPollQuestionType.shortAnswer:
      return 'Short Answer';
  }
}

export function splitLinksAndContent(
  text: string,
  { pressHandler, style }: any
): string | (string | React.ReactElement)[] {
  // Regular expression to find links in a string
  const pattern = /(^|\s)http[s]?:\/\/\S+/g;

  // Find all links in the text
  const links = text.match(pattern) || [];

  if (links.length <= 0) {
    return text;
  }

  // Split the text into an array of links and content
  const parts = text.replace(pattern, '^<link>^').split('^');

  return parts.map((p, i) => {
    if (p !== '<link>') {
      return p;
    }
    const link = links.pop();
    return link ? (
      <Text key={link + i} onPress={() => pressHandler(link)} style={style}>
        {link}
      </Text>
    ) : (
      p
    );
  });
}
