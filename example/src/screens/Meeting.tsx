import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  SafeAreaView,
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
import {navigate} from '../services/navigation';
import dimension from '../utils/dimension';

type Peer = {
  trackId?: string;
  peerName?: string;
};

const Meeting = ({
  messages,
  addMessageRequest,
  clearMessageRequest,
  audioState,
  videoState,
}: {
  messages: any;
  addMessageRequest: Function;
  clearMessageRequest: Function;
  audioState: boolean;
  videoState: boolean;
  state: any;
}) => {
  const [instance, setInstance] = useState<any>(null);
  const [trackId, setTrackId] = useState<Peer>({});
  const [remoteTrackIds, setRemoteTrackIds] = useState<Peer[]>([]);
  const [isMute, setIsMute] = useState(false);
  const [muteVideo, setMuteVideo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [safeHeight, setSafeHeight] = useState(0);

  const updateVideoIds = (remotePeers: any, localPeer: any) => {
    // get local track Id
    const localTrackId = localPeer?.videoTrack?.trackId;
    const localPeerName = localPeer?.name;
    if (localTrackId) {
      setTrackId({trackId: localTrackId, peerName: localPeerName});
    }

    const remoteVideoIds: Peer[] = [];

    if (remotePeers) {
      remotePeers.map((remotePeer: any) => {
        const remoteTrackId = remotePeer?.videoTrack?.trackId;
        const remotePeerName = remotePeer?.name;
        if (remoteTrackId) {
          remoteVideoIds.push({
            trackId: remoteTrackId,
            peerName: remotePeerName,
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
    localPeer: any;
    remotePeers: any;
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
    localPeer: any;
    remotePeers: any;
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
    localPeer: any;
    remotePeers: any;
  }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onTrack');
  };

  const onMessage = (data: any) => {
    addMessageRequest({data, isLocal: false});
    console.log(data, 'data in onMessage');
  };

  const onError = (data: any) => {
    console.log(data, 'data in onError');
  };

  const onSpeaker = (data: any) => {
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
    setIsMute(!audioState);
    setMuteVideo(!videoState);
  }, [audioState, videoState]);

  useEffect(() => {
    if (instance) {
      const localTrackId = instance?.localPeer?.videoTrack?.trackId;
      const localPeerName = instance?.localPeer?.name;
      if (localTrackId) {
        setTrackId({trackId: localTrackId, peerName: localPeerName});
      }

      const remoteVideoIds: Peer[] = [];

      const remotePeers = instance?.remotePeers ? instance.remotePeers : [];

      if (remotePeers) {
        remotePeers.map((remotePeer: any) => {
          const remoteTrackId = remotePeer?.videoTrack?.trackId;
          const remotePeerName = remotePeer?.name;
          if (remoteTrackId) {
            remoteVideoIds.push({
              trackId: remoteTrackId,
              peerName: remotePeerName,
            });
          }
        });

        setRemoteTrackIds(remoteVideoIds as []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  const getLocalVideoStyles = () => {
    // if (remoteTrackIds && remoteTrackIds.length === 1) {
    //   return styles.floatingTile;
    // }
    // if (remoteTrackIds.length && remoteTrackIds.length > 1) {
    //   return styles.generalTile;
    // }
    return styles.generalTile;
  };

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
        <ScrollView style={styles.scroll}>
          <View style={styles.videoView}>
            <View
              style={[
                getLocalVideoStyles(),
                {
                  height: dimension.viewHeight(
                    (safeHeight - dimension.viewHeight(90)) / 2,
                  ),
                },
              ]}>
              <HmsView style={styles.hmsView} trackId={trackId.trackId} />
              <View style={styles.peerNameContainer}>
                <Text style={styles.peerName}>{trackId.peerName}</Text>
              </View>
            </View>
            {remoteTrackIds.map((item: Peer) => {
              return (
                <View
                  key={item.trackId}
                  style={[
                    getRemoteVideoStyles(),
                    {
                      height: dimension.viewHeight(
                        (safeHeight - dimension.viewHeight(90)) / 2,
                      ),
                    },
                  ]}>
                  <HmsView trackId={item.trackId} style={styles.hmsView} />
                  <View style={styles.peerNameContainer}>
                    <Text style={styles.peerName}>{item.peerName}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <View style={styles.iconContainers}>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={async () => {
            setIsMute(!isMute);
            instance.localPeer.localAudioTrack().setMute(!isMute);
          }}>
          <Feather
            name={isMute ? 'mic-off' : 'mic'}
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
            setMuteVideo(!muteVideo);
            instance.localPeer.localVideoTrack().setMute(!muteVideo);
          }}>
          <Feather
            name={muteVideo ? 'video-off' : 'video'}
            style={styles.videoIcon}
            size={dimension.viewHeight(30)}
          />
        </TouchableOpacity>
      </View>
      {modalVisible && (
        <ChatWindow
          messages={messages}
          cancel={() => setModalVisible(false)}
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
  peerNameContainer: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: 'rgba(137,139,155,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
  },
  peerName: {
    color: 'blue',
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
