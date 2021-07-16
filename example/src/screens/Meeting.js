import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import HmsManager, {
  HmsView,
  HMSUpdateListenerActions,
} from 'react-native-hmssdk';
import { navigate } from '../services/navigation';
import Feather from 'react-native-vector-icons/Feather';

const Meeting = () => {
  const [instance, setInstance] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [remoteTrackIds, setRemoteTrackIds] = useState([]);
  const [isMute, setIsMute] = useState(false);
  const [switchCamera, setSwitchCamera] = useState(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {trackId !== '' && (
          <View style={styles.videoView}>
            <View style={styles.singleVideo}>
              <HmsView style={styles.hmsView} trackId={trackId} />
            </View>
            {remoteTrackIds.map((item) => {
              return (
                <View key={item} style={styles.singleVideo}>
                  <HmsView trackId={item} style={styles.hmsView} />
                </View>
              );
            })}
          </View>
        )}
      </View>
      <View style={styles.iconContainers}>
        <TouchableOpacity
          style={styles.singleIconContainer}
          onPress={async () => {
            setIsMute(!isMute);
            instance.setLocalPeerMute(!isMute);
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
            instance.setLocalPeerVideoMute(!muteVideo);
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
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  singleVideo: {
    flex: 1,
    width: '100%',
    height: '50%',
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
