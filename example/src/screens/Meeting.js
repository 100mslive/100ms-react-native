import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  // Image,
} from 'react-native';
import { connect } from 'react-redux';
import HmsManager, {
  HmsView,
  HMSUpdateListenerActions,
  HMSMessage,
} from 'react-native-hmssdk';
import Feather from 'react-native-vector-icons/Feather';

import ChatWindow from '../components/ChatWindow';
import { addMessage, clearMessageData } from '../redux/actions/index';
import { navigate } from '../services/navigation';
import dimension from '../utils/dimension';

const Meeting = ({ messages, addMessageRequest, clearMessageRequest }) => {
  const [instance, setInstance] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [remoteTrackIds, setRemoteTrackIds] = useState([]);
  const [isMute, setIsMute] = useState(false);
  const [muteVideo, setMuteVideo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const updateVideoIds = (remotePeers, localPeer) => {
    // get local track Id
    const localTrackId = localPeer?.videoTrack?.trackId;

    if (localTrackId) {
      setTrackId(localTrackId);
    }

    const remoteVideoIds = [];

    if (remotePeers) {
      remotePeers.map((remotePeer) => {
        const remoteTrackId = remotePeer?.videoTrack?.trackId;

        if (remoteTrackId) {
          remoteVideoIds.push(remoteTrackId);
        }
      });

      setRemoteTrackIds(remoteVideoIds);
    }
  };

  const onJoinListener = ({ room, localPeer, remotePeers }) => {
    console.log(localPeer, remotePeers, 'data in onJoin');
  };

  const onRoomListener = ({ room, localPeer, remotePeers }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onRoom');
  };

  const onPeerListener = ({ room, remotePeers, localPeer }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onPeer');
  };

  const onTrackListener = ({ room, remotePeers, localPeer }) => {
    updateVideoIds(remotePeers, localPeer);
    console.log(remotePeers, localPeer, 'data in onTrack');
  };

  const onMessage = (data) => {
    addMessageRequest({ data, isLocal: false });
    console.log(data, 'data in onMessage');
  };

  const onError = (data) => {
    console.log(data, 'data in onError');
  };

  const onSpeaker = (data) => {
    // console.log(data, 'data in onSpeaker');
  };

  const reconnecting = (data) => {
    console.log(data);
  };

  const reconnected = (data) => {
    console.log(data);
  };

  const updateHmsInstance = async () => {
    const HmsInstance = await HmsManager.build();
    setInstance(HmsInstance);
    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      onJoinListener
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ROOM_UPDATE,
      onRoomListener
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      onPeerListener
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_TRACK_UPDATE,
      onTrackListener
    );

    HmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_MESSAGE,
      onMessage
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_SPEAKER,
      onSpeaker
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.RECONNECTING,
      reconnecting
    );

    HmsInstance.addEventListener(
      HMSUpdateListenerActions.RECONNECTED,
      reconnected
    );
  };

  useEffect(() => {
    updateHmsInstance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instance) {
      const localTrackId = instance.localPeer?.videoTrack?.trackId;

      if (localTrackId) {
        setTrackId(localTrackId);
      }

      const remoteVideoIds = [];

      const remotePeers = instance?.remotePeers ? instance.remotePeers : [];

      if (remotePeers) {
        remotePeers.map((remotePeer) => {
          const remoteTrackId = remotePeer?.videoTrack?.trackId;

          if (remoteTrackId) {
            remoteVideoIds.push(remoteTrackId);
          }
        });

        setRemoteTrackIds(remoteVideoIds);
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

  const getRemoteVideoStyles = (index) => {
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
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.videoView}>
          <View style={getLocalVideoStyles()}>
            <HmsView style={styles.hmsView} trackId={trackId} />
          </View>
          {remoteTrackIds.map((item, index) => {
            return (
              <View key={item} style={getRemoteVideoStyles(index)}>
                <HmsView trackId={item} style={styles.hmsView} />
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.iconContainers}>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={async () => {
            setIsMute(!isMute);
            instance.localPeer.localAudioTrack().setMute(!isMute);
          }}
        >
          <Feather
            name={isMute ? 'mic-off' : 'mic'}
            style={styles.videoIcon}
            size={30}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.leaveIconContainer}
          onPress={async () => {
            instance.leave();
            clearMessageRequest();
            navigate('WelcomeScreen');
          }}
        >
          <Feather name="phone-off" style={styles.leaveIcon} size={30} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Feather name="message-circle" style={styles.videoIcon} size={30} />
          {/* <Image
            source={require('../assets/flipCamera.svg')}
            style={styles.cameraImage}
          /> */}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={() => {
            setMuteVideo(!muteVideo);
            instance.localPeer.localVideoTrack().setMute(!muteVideo);
          }}
        >
          <Feather
            name={muteVideo ? 'video-off' : 'video'}
            style={styles.videoIcon}
            size={30}
          />
        </TouchableOpacity>
      </View>
      {modalVisible && (
        <ChatWindow
          messages={messages}
          cancel={() => setModalVisible(false)}
          send={(value) => {
            const hmsMessage = new HMSMessage({
              sender: 'sender',
              type: 'chat',
              time: new Date().toISOString(),
              message: value,
            });

            instance.send(hmsMessage);
            addMessageRequest({ data: hmsMessage, isLocal: true });
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: dimension.viewHeight(896),
    paddingTop: dimension.viewHeight(36),
  },
  videoView: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
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
    height: dimension.viewHeight(385),
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
    bottom: 0,
    paddingBottom: 22,
    paddingTop: 15,
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
    padding: 10,
    borderRadius: 50,
  },
  singleIconContainer: {
    padding: 10,
  },
  leaveIcon: {
    color: 'white',
  },

  cameraImage: {
    width: 30,
    height: 30,
  },
  scroll: {
    width: '100%',
    height: dimension.viewHeight(770),
  },
});

const mapDispatchToProps = (dispatch) => ({
  addMessageRequest: (data) => dispatch(addMessage(data)),
  clearMessageRequest: (data) => dispatch(clearMessageData(data)),
});

const mapStateToProps = (state) => ({
  messages: state?.messages?.messages,
});

export default connect(mapStateToProps, mapDispatchToProps)(Meeting);
