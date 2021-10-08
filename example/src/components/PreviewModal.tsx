import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {HMSVideoViewMode, HmsView} from '@100mslive/react-native-hms';

const PreviewModal = ({
  trackId,
  setAudio,
  setVideo,
  join,
}: {
  trackId: string;
  setAudio: Function;
  setVideo: Function;
  join: Function;
}) => {
  const [isMute, setIsMute] = useState(false);
  const [muteVideo, setMuteVideo] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <HmsView
          scaleType={HMSVideoViewMode.ASPECT_FILL}
          sink={true}
          style={styles.hmsView}
          trackId={trackId}
        />
      </View>
      <View style={styles.buttonRow}>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            style={styles.singleIconContainer}
            onPress={async () => {
              setIsMute(!isMute);
              setAudio(!isMute);
            }}>
            <Feather
              name={isMute ? 'mic-off' : 'mic'}
              style={styles.videoIcon}
              size={50}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.singleIconContainer}
            onPress={() => {
              setMuteVideo(!muteVideo);
              setVideo(!muteVideo);
            }}>
            <Feather
              name={muteVideo ? 'video-off' : 'video'}
              style={styles.videoIcon}
              size={50}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.joinButtonContainer}>
          <TouchableOpacity
            style={styles.buttonTextContainer}
            onPress={() => {
              join();
            }}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PreviewModal;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(34, 34, 34, 0.3)',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  hmsView: {
    height: '100%',
    width: '100%',
  },
  buttonTextContainer: {
    backgroundColor: '#4578e0',
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
  videoIcon: {
    color: '#4578e0',
  },
  joinButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    paddingHorizontal: 8,
  },
  buttonRow: {
    position: 'absolute',
    bottom: '10%',
    width: '100%',
  },
  iconContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  singleIconContainer: {
    marginHorizontal: 18,
  },
  joinButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
