import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import HmsManager, {
  HmsView,
  HMSUpdateListenerActions,
} from 'react-native-hmssdk';
import Feather from 'react-native-vector-icons/Feather';

import { navigate } from '../services/navigation';
import dimension from '../utils/dimension';

const Meeting = () => {
  const [instance, setInstance] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [remoteTrackIds, setRemoteTrackIds] = useState([]);
  const [isMute, setIsMute] = useState(false);
  const [muteVideo, setMuteVideo] = useState(false);

  const onJoinListener = (data) => {
    console.log(data, 'data in onJoin');
  };

  const onRoomListener = (data) => {
    console.log(data, 'data in onRoom');
  };

  const onPeerListener = (data) => {
    console.log(data, 'data in onPeer');
  };

  const onTrackListener = (data) => {
    if (data.trackId) {
      setTrackId(trackId);
    }
    if (data.remoteTracks && data.remoteTracks.length) {
      setRemoteTrackIds(data.remoteTracks);
    } else {
      setRemoteTrackIds([]);
    }
    console.log(data, 'data in onTrack');
  };

  const onMessage = (data) => {
    console.log(data, 'data in onMessage');
  };

  const onError = (data) => {
    console.log(data, 'data in onError');
  };

  const onSpeaker = (data) => {
    console.log(data, 'data in onSpeaker');
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
    console.log(instance, 'instance');
    if (instance) {
      instance.getTrackIds(({ remoteTracks, localTrackId }) => {
        console.log(remoteTrackIds, localTrackId);
        setTrackId(localTrackId);
        setRemoteTrackIds(remoteTracks);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  const getLocalVideoStyles = () => {
    if (remoteTrackIds && remoteTrackIds.length === 1) {
      return styles.floatingTile;
    }
    if (remoteTrackIds.length && remoteTrackIds.length > 1) {
      return styles.generalTile;
    }
    return styles.fullScreenTile;
  };

  const getRemoteVideoStyles = (index) => {
    if (remoteTrackIds && remoteTrackIds.length === 1) {
      return styles.fullScreenTile;
    }
    if (remoteTrackIds.length && remoteTrackIds.length > 1) {
      if (index === remoteTrackIds.length - 1 && index % 2 === 1) {
        return styles.fullWidthTile;
      }
      return styles.generalTile;
    }
    return styles.fullScreenTile;
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {trackId !== '' && (
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
        )}
      </View>
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
            navigate('WelcomeScreen');
          }}
        >
          <Feather name="phone-off" style={styles.leaveIcon} size={30} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => {
            setSwitchCamera(!switchCamera);
            instance.switchCamera();
          }}
        >
          <Text style={styles.buttonText}>Switch-Camera</Text>
        </TouchableOpacity> */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
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
    height: dimension.viewHeight(445),
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
    position: 'absolute',
    justifyContent: 'space-around',
    bottom: 0,
    paddingBottom: 22,
    paddingTop: 15,
    width: '100%',
    left: 0,
    right: 0,
    zIndex: 500,
    backgroundColor: 'white',
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
});

export default Meeting;
