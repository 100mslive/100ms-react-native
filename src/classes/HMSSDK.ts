import { NativeEventEmitter, NativeModules } from 'react-native';
import HMSUpdateListenerActions from './HMSUpdateListenerActions';
import type HMSConfig from './HMSConfig';
import type HMSLocalPeer from './HMSLocalPeer';
import type HMSRemotePeer from './HMSRemotePeer';
import type HMSRoom from './HMSRoom';
import HMSEncoder from './HMSEncoder';
import type HMSMessage from './HMSMessage';

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

  onJoinDelegate?: Function;
  onRoomDelegate?: Function;
  onPeerDelegate?: Function;
  onTrackDelegate?: Function;
  onErrorDelegate?: Function;
  onMessageDelegate?: Function;
  onSpeakerDelegate?: Function;
  onReconnectingDelegate?: Function;
  onReconnectedDelegate?: Function;

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

  attachListeners() {
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
  }

  /**
   * takes an instance of [HMSConfig]{@link HMSConfig} and joins the room
   * after joining the room user will start receiving the events and updates of the room
   *
   * @param {HMSConfig} config
   * @memberof HMSSDK
   */
  async join(config: HMSConfig) {
    this.attachListeners();
    await HmsManager.join(config);
  }

  /**
   * This is a prototype method for interaction with native sdk will be @deprecated in future
   *
   * @param {*} callback
   * @memberof HMSSDK
   */
  async getTrackIds(callback: any) {
    await HmsManager.getTrackIds(callback);
  }

  /**
   * Calls leave function of native sdk and session of current user is invalidated
   *
   * @memberof HMSSDK
   */
  async leave() {
    await HmsManager.leave();
  }

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
  async addEventListener(action: HMSUpdateListenerActions, callback: Function) {
    switch (action) {
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
  }

  onJoinListener = (data: any) => {
    // Preprocessing
    console.log(data, 'data after onJoin');
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
    if (this.onMessageDelegate) {
      this.onMessageDelegate(data);
    }
  };

  onSpeakerListener = (data: any) => {
    if (this.onSpeakerDelegate) {
      this.onSpeakerDelegate(data);
    }
  };

  onErrorListener = (data: any) => {
    if (this.onErrorDelegate) {
      this.onErrorDelegate(data);
    }
  };

  reconnectingListener = (data: any) => {
    if (this.onReconnectingDelegate) {
      this.onReconnectingDelegate(data);
    }
  };

  reconnectedListener = (data: any) => {
    if (this.onReconnectedDelegate) {
      this.onReconnectedDelegate(data);
    }
  };
}
