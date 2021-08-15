import { NativeEventEmitter, NativeModules } from 'react-native';
import HMSUpdateListenerActions from './HMSUpdateListenerActions';
import type HMSConfig from './HMSConfig';
import type HMSLocalPeer from './HMSLocalPeer';
import type HMSRemotePeer from './HMSRemotePeer';
import type HMSRoom from './HMSRoom';
import HMSEncoder from './HMSEncoder';
import HMSMessage from './HMSMessage';

const {
  /**
   * @ignore
   */
  HmsManager,
} = NativeModules;

const HmsEventEmitter = new NativeEventEmitter(HmsManager);

let HmsSdk: HMSSDK | undefined;

export default class HMSSDK {
  room?: HMSRoom;
  localPeer?: HMSLocalPeer;
  remotePeers?: HMSRemotePeer[];

  onPreviewDelegate?: any;
  onJoinDelegate?: any;
  onRoomDelegate?: any;
  onPeerDelegate?: any;
  onTrackDelegate?: any;
  onErrorDelegate?: any;
  onMessageDelegate?: any;
  onSpeakerDelegate?: any;
  onReconnectingDelegate?: any;
  onReconnectedDelegate?: any;

  /**
   * - Returns an instance of [HMSSDK]{@link HMSSDK}
   * - This function must be called to get an instance of HMSSDK class and only then user can interact with its methods
   *
   * @static
   * @returns
   * @memberof HMSSDK
   */
  static async build() {
    if (HmsSdk) {
      return HmsSdk;
    }
    HmsManager.build();
    HmsSdk = new HMSSDK();
    return HmsSdk;
  }

  attachPreviewListener = () => {
    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_PREVIEW,
      this.onPreviewListener
    );
  };

  attachListeners = () => {
    console.log('attatch listeners');
    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_JOIN,
      this.onJoinListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      this.onRoomListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      this.onPeerListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      this.onTrackListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_ERROR,
      this.onErrorListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      this.onMessageListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      this.onSpeakerListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.RECONNECTING,
      this.reconnectingListener
    );

    HmsEventEmitter.addListener(
      HMSUpdateListenerActions.RECONNECTED,
      this.reconnectedListener
    );
  };

  /**
   * takes an instance of [HMSConfig]{@link HMSConfig} and joins the room
   * after joining the room user will start receiving the events and updates of the room
   *
   * @param {HMSConfig} config
   * @memberof HMSSDK
   */
  join = async (config: HMSConfig) => {
    this.attachListeners();
    await HmsManager.join(config);
  };

  preview = (config: HMSConfig) => {
    this.attachPreviewListener();
    HmsManager.preview(config);
  };

  /**
   * Calls leave function of native sdk and session of current user is invalidated
   *
   * @memberof HMSSDK
   */
  leave = () => {
    HmsManager.leave();
  };

  send = (data: HMSMessage) => {
    HmsManager.send(data);
  };

  /**
   * - This is a prototype event listener that takes action and listens for updates related to that particular action
   * - This method will be @deprecated in future and event listener will be passed in join method
   *
   * @param {string} action
   * @param {*} callback
   * @memberof HMSSDK
   */
  addEventListener = (action: HMSUpdateListenerActions, callback: any) => {
    switch (action) {
      case HMSUpdateListenerActions.ON_PREVIEW:
        this.onPreviewDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_JOIN:
        this.onJoinDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_ROOM_UPDATE:
        this.onRoomDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_PEER_UPDATE:
        this.onPeerDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_TRACK_UPDATE:
        this.onTrackDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_ERROR:
        this.onErrorDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_MESSAGE:
        this.onMessageDelegate = callback;
        break;
      case HMSUpdateListenerActions.ON_SPEAKER:
        this.onSpeakerDelegate = callback;
        break;
      case HMSUpdateListenerActions.RECONNECTING:
        this.onReconnectingDelegate = callback;
        break;
      case HMSUpdateListenerActions.RECONNECTED:
        this.onReconnectedDelegate = callback;
        break;
      default:
        console.log('default case');
    }
  };

  onPreviewListener = (data: any) => {
    console.log(data, 'data in preview');
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );

    const previewTracks = HMSEncoder.encodeHmsPreviewTracks(data.previewTracks);

    this.localPeer = localPeer;
    this.room = room;
    if (this.onPreviewDelegate) {
      this.onPreviewDelegate({ ...data, room, localPeer, previewTracks });
    }
  };

  onJoinListener = (data: any) => {
    // Preprocessing
    console.log(data, 'join data');
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers
    );
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onJoinDelegate) {
      this.onJoinDelegate({ ...data, room, localPeer, remotePeers });
    }
  };

  onRoomListener = (data: any) => {
    console.log(data, 'room data');
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers
    );
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onRoomDelegate) {
      this.onRoomDelegate({ ...data, room, localPeer, remotePeers });
    }
  };

  onPeerListener = (data: any) => {
    console.log(data, 'peer data');
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers
    );
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onPeerDelegate) {
      this.onPeerDelegate({ ...data, room, localPeer, remotePeers });
    }
  };

  onTrackListener = (data: any) => {
    console.log(data, 'track data');
    const room: HMSRoom = HMSEncoder.encodeHmsRoom(data.room);
    const localPeer: HMSLocalPeer = HMSEncoder.encodeHmsLocalPeer(
      data.localPeer
    );
    const remotePeers: HMSRemotePeer[] = HMSEncoder.encodeHmsRemotePeers(
      data.remotePeers
    );
    this.room = room;
    this.localPeer = localPeer;
    this.remotePeers = remotePeers;
    if (this.onTrackDelegate) {
      this.onTrackDelegate({ ...data, room, localPeer, remotePeers });
    }
  };

  onMessageListener = (data: any) => {
    console.log(data, 'message data');
    const message = new HMSMessage(data);
    if (this.onMessageDelegate) {
      this.onMessageDelegate(message);
    }
  };

  onSpeakerListener = (data: any) => {
    console.log(data, 'speaker data');
    if (this.onSpeakerDelegate) {
      this.onSpeakerDelegate(data);
    }
  };

  onErrorListener = (data: any) => {
    console.log(data, 'error data');
    if (this.onErrorDelegate) {
      this.onErrorDelegate(data);
    }
  };

  reconnectingListener = (data: any) => {
    console.log(data, 'reconnecting data');
    if (this.onReconnectingDelegate) {
      this.onReconnectingDelegate(data);
    }
  };

  reconnectedListener = (data: any) => {
    console.log(data, 'reconnected data');
    if (this.onReconnectedDelegate) {
      this.onReconnectedDelegate(data);
    }
  };
}
