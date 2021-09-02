import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Platform,
  FlatList,
} from 'react-native';
import {connect} from 'react-redux';
import HmsManager, {
  HmsView,
  HMSUpdateListenerActions,
  HMSMessage,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ChatWindow from '../components/ChatWindow';
import {addMessage, clearMessageData} from '../redux/actions/index';
import {useNavigation} from '@react-navigation/native';
import dimension from '../utils/dimension';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {AppStackParamList} from '../navigator';
import {getRandomColor, getInitials} from '../utils/functions';

type Peer = {
  trackId?: string;
  peerName: string;
  isAudioMute: boolean;
  isVideoMute: boolean;
  peerId: String;
  colour: string;
  sink: Boolean;
};

type DisplayNameProps = {
  peer: Peer;
  videoStyles: Function;
  safeHeight: any;
  speakers: Array<String>;
};

type MeetingProps = {
  messages: any;
  addMessageRequest: Function;
  clearMessageRequest: Function;
  audioState: boolean;
  videoState: boolean;
  state: any;
};

type MeetingScreenProp = StackNavigationProp<AppStackParamList, 'Meeting'>;

const DEFAULT_PEER: Peer = {
  trackId: Math.random().toString(),
  peerName: Math.random().toString(),
  isAudioMute: true,
  isVideoMute: true,
  peerId: Math.random().toString(),
  colour: 'red',
  sink: true,
};

const DisplayName = ({
  peer,
  videoStyles,
  safeHeight,
  speakers,
}: DisplayNameProps) => {
  const {peerName, isAudioMute, isVideoMute, trackId, colour, peerId, sink} =
    peer;
  const speaking = speakers.includes(peerId);
  return (
    <View
      key={trackId}
      style={[
        videoStyles(),
        {
          height:
            Platform.OS === 'android'
              ? safeHeight / 2 - 2
              : (safeHeight - dimension.viewHeight(90)) / 2 - 2,
        },
        speaking && styles.highlight,
      ]}>
      {isVideoMute ? (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, {backgroundColor: colour}]}>
            <Text style={styles.avatarText}>{getInitials(peerName!)}</Text>
          </View>
        </View>
      ) : (
        <HmsView sink={sink} trackId={trackId} style={styles.hmsView} />
      )}
      <View style={styles.displayContainer}>
        <View style={styles.peerNameContainer}>
          <Text numberOfLines={2} style={styles.peerName}>
            {peerName}
          </Text>
        </View>
        <View style={styles.micContainer}>
          <Feather
            name={isAudioMute ? 'mic-off' : 'mic'}
            style={styles.mic}
            size={20}
          />
        </View>
        <View style={styles.micContainer}>
          <Feather
            name={isVideoMute ? 'video-off' : 'video'}
            style={styles.mic}
            size={20}
          />
        </View>
      </View>
    </View>
  );
};

const peerColour: any = {};
const getPeerColour = (trackId: string): string => {
  let colour = 'red';
  if (peerColour[trackId]) {
    colour = peerColour[trackId];
  } else {
    colour = getRandomColor();
    peerColour[trackId] = colour;
  }
  return colour;
};

const Meeting = ({
  messages,
  addMessageRequest,
  clearMessageRequest,
}: MeetingProps) => {
  const [instance, setInstance] = useState<any>(null);
  const [trackId, setTrackId] = useState<Peer>(DEFAULT_PEER);
  const [remoteTrackIds, setRemoteTrackIds] = useState<Peer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [safeHeight, setSafeHeight] = useState(0);
  const [speakers, setSpeakers] = useState([]);
  const [notification, setNotification] = useState(false);

  const navigate = useNavigation<MeetingScreenProp>().navigate;

  const decode = (peer: any): Peer => {
    const peerId = peer?.peerID;
    const peerTrackId = peer?.videoTrack?.trackId;
    const peerName = peer?.name;
    const peerIsAudioMute = peer?.audioTrack?.mute;
    const peerIsVideoMute = peer?.videoTrack?.mute;
    const peerColour = getPeerColour(peerTrackId);
    return {
      trackId: peerTrackId,
      peerName: peerName,
      isAudioMute: peerIsAudioMute,
      isVideoMute: peerIsVideoMute,
      peerId: peerId,
      colour: peerColour,
      sink: true,
    };
  };

  const updateVideoIds = (remotePeers: any, localPeer: any) => {
    // get local track Id
    const localTrackId = localPeer?.videoTrack?.trackId;
    if (localTrackId) {
      setTrackId(decode(localPeer));
    }

    const remoteVideoIds: Peer[] = [];

    if (remotePeers) {
      remotePeers.map((remotePeer: any, index: number) => {
        const remoteTrackId = remotePeer?.videoTrack?.trackId;
        if (remoteTrackId) {
          remoteVideoIds.push(decode(remotePeer));
        } else {
          remoteVideoIds.push({
            trackId: index.toString(),
            peerName: remotePeer?.name,
            isAudioMute: remotePeer?.audioTrack?.mute,
            isVideoMute: remotePeer?.videoTrack?.mute,
            peerId: '',
            colour: 'red',
            sink: true,
          });
        }
      });

      setRemoteTrackIds(remoteVideoIds as []);
    }
  };

  const onJoinListener = ({
    localPeer,
    remotePeers,
  }: {
    room?: any;
    localPeer: any;
    remotePeers: any;
  }) => {
    console.log(localPeer, remotePeers, 'data in onJoin');
  };

  const onRoomListener = ({
    // room,
    localPeer,
    remotePeers,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onRoom');
  };

  const onPeerListener = ({
    // room,
    remotePeers,
    localPeer,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onPeer');
  };

  const onTrackListener = ({
    // room,
    remotePeers,
    localPeer,
  }: {
    room?: any;
    localPeer: Peer;
    remotePeers: Peer;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onTrack');
  };

  const onMessage = (data: any) => {
    addMessageRequest({data, isLocal: false});
    setNotification(true);
    console.log(data, 'data in onMessage');
  };

  const onError = (data: any) => {
    console.log(data, 'data in onError');
  };

  const onSpeaker = (data: any) => {
    setSpeakers(data?.peers);
    console.log(data, 'data in onSpeaker');
  };

  const reconnecting = (data: any) => {
    console.log(data);
  };

  const reconnected = (data: any) => {
    console.log(data);
  };

  const updateHmsInstance = async () => {
    const HmsInstance = await HmsManager.build();
    setInstance(HmsInstance);
    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      onRoomListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      onPeerListener,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      onTrackListener,
    );

    HmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      onMessage,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      onSpeaker,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.RECONNECTING,
      reconnecting,
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.RECONNECTED,
      reconnected,
    );
  };

  useEffect(() => {
    updateHmsInstance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instance) {
      updateVideoIds(instance?.remotePeers, instance?.localPeer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  // const getLocalVideoStyles = () => {
  // if (remoteTrackIds && remoteTrackIds.length === 1) {
  //   return styles.floatingTile;
  // }
  // if (remoteTrackIds.length && remoteTrackIds.length > 1) {
  //   return styles.generalTile;
  // }
  //   return styles.generalTile;
  // };

  const getRemoteVideoStyles = () => {
    // if (remoteTrackIds && remoteTrackIds.length === 1) {
    //   return styles.fullScreenTile;
    // }
    // if (remoteTrackIds.length && remoteTrackIds.length > 1) {
    //   if (index === remoteTrackIds.length - 1 && index % 2 === 1) {
    //     return styles.fullWidthTile;
    //   }
    //   return styles.generalTile;
    // }
    return styles.generalTile;
  };

  const onViewRef = React.useRef(({viewableItems}: any) => {
    if (viewableItems) {
      const viewableItemsIds = viewableItems.map(
        (viewableItem: {
          index: Number;
          item: Peer;
          key: String;
          isViewable: Boolean;
        }) => {
          return viewableItem?.item?.trackId;
        },
      );

      const inst = HmsManager.build();
      const remotePeers = inst?.remotePeers;
      if (remotePeers) {
        const sinkRemoteTrackIds = remotePeers.map((peer: Peer) => {
          const remotePeer = decode(peer);
          const videoTrackId = remotePeer.trackId;
          if (!viewableItemsIds?.includes(videoTrackId)) {
            return {
              ...remotePeer,
              sink: false,
            };
          }
          return remotePeer;
        });
        setRemoteTrackIds(sinkRemoteTrackIds ? sinkRemoteTrackIds : []);
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.wrapper}
        onLayout={data => {
          const height = data?.nativeEvent?.layout?.height;
          if (height && safeHeight === 0) {
            setSafeHeight(height);
          }
        }}>
        <FlatList
          data={[trackId, ...remoteTrackIds]}
          renderItem={({item}) => {
            if (item) {
              return (
                <DisplayName
                  peer={item}
                  videoStyles={getRemoteVideoStyles}
                  safeHeight={safeHeight}
                  speakers={speakers}
                />
              );
            } else return <></>;
          }}
          numColumns={2}
          onViewableItemsChanged={onViewRef.current}
          keyExtractor={item => item?.trackId!}
        />
      </View>
      <View style={styles.iconContainers}>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={async () => {
            setTrackId({
              ...trackId,
              isAudioMute: !trackId.isAudioMute,
            });
            instance.localPeer.localAudioTrack().setMute(!trackId.isAudioMute);
          }}>
          <Feather
            name={trackId.isAudioMute ? 'mic-off' : 'mic'}
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setModalVisible(true);
          }}>
          <Feather
            name="message-circle"
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
          {notification && <View style={styles.messageDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            instance.localPeer.localVideoTrack().switchCamera();
          }}>
          <Ionicons
            name="camera-reverse-outline"
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setTrackId({
              ...trackId,
              isVideoMute: !trackId.isVideoMute,
            });
            instance.localPeer.localVideoTrack().setMute(!trackId.isVideoMute);
          }}>
          <Feather
            name={trackId.isVideoMute ? 'video-off' : 'video'}
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.leaveIconContainer}
          onPress={async () => {
            instance.leave();
            clearMessageRequest();
            navigate('WelcomeScreen');
          }}>
          <Feather
            name="phone-off"
            style={styles.leaveIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
      </View>
      {modalVisible && (
        <ChatWindow
          messages={messages}
          cancel={() => {
            setModalVisible(false);
            setNotification(false);
          }}
          send={(value: string) => {
            if (value.length > 0) {
              const hmsMessage = new HMSMessage({
                type: 'chat',
                time: new Date().toISOString(),
                message: value,
              });

              instance.send(hmsMessage);
              addMessageRequest({data: hmsMessage, isLocal: true});
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: dimension.viewHeight(896),
  },
  videoView: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  videoIcon: {},
  fullScreenTile: {
    height: dimension.viewHeight(896),
    width: dimension.viewWidth(414),
  },
  floatingTile: {
    width: dimension.viewWidth(170),
    height: dimension.viewHeight(300),
    position: 'absolute',
    bottom: dimension.viewHeight(100),
    right: dimension.viewWidth(10),
    zIndex: 100,
  },
  generalTile: {
    width: dimension.viewWidth(206),
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
  },
  fullWidthTile: {
    height: dimension.viewHeight(445),
    width: dimension.viewWidth(414),
  },
  hmsView: {
    height: '100%',
    width: '100%',
  },
  iconContainers: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: dimension.viewHeight(22),
    paddingTop: dimension.viewHeight(15),
    width: '100%',
    backgroundColor: 'white',
    height: dimension.viewHeight(90),
  },

  buttonText: {
    backgroundColor: '#4578e0',
    padding: 10,
    borderRadius: 10,
    color: '#efefef',
  },

  leaveIconContainer: {
    backgroundColor: '#ee4578',
    padding: dimension.viewHeight(10),
    borderRadius: 50,
  },
  singleIconContainer: {
    padding: dimension.viewHeight(10),
  },
  leaveIcon: {
    color: 'white',
  },

  cameraImage: {
    width: dimension.viewHeight(30),
    height: dimension.viewHeight(30),
  },
  scroll: {
    width: '100%',
  },
  wrapper: {
    flex: 1,
  },
  displayContainer: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: 'rgba(137,139,155,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerName: {
    color: 'blue',
  },
  peerNameContainer: {
    maxWidth: 80,
  },
  micContainer: {
    paddingHorizontal: 3,
  },
  mic: {
    color: 'blue',
  },
  avatarContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    aspectRatio: 1,
    width: '50%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    color: 'white',
  },
  highlight: {
    backgroundColor: 'blue',
    padding: 5,
    borderRadius: 10,
  },
  messageDot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'red',
    right: dimension.viewWidth(10),
    top: dimension.viewHeight(10),
  },
});

const mapDispatchToProps = (dispatch: Function) => ({
  addMessageRequest: (data: any) => dispatch(addMessage(data)),
  clearMessageRequest: () => dispatch(clearMessageData()),
});

const mapStateToProps = (state: any) => ({
  messages: state?.messages?.messages,
  audioState: state?.app?.audioState,
  videoState: state?.app?.videoState,
});

export default connect(mapStateToProps, mapDispatchToProps)(Meeting);
