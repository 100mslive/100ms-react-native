import React, {useRef, useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {View, Text, Platform, LayoutAnimation} from 'react-native';
import VideoPlayer from 'react-native-video-controls';
import type {LoadError} from 'react-native-video';
import Toast from 'react-native-simple-toast';
import {
  type HMSRoom,
  HMSUpdateListenerActions,
  HMSPlayer,
} from '@100mslive/react-native-hms';

import LiveButton, {LiveStates} from '../../components/LiveButton';

import {styles} from './styles';
import {RootState} from '../../redux';
import {PipModes} from '../../utils/types';

type HLSViewProps = {
  room?: HMSRoom;
};

const HLSView = ({room}: HLSViewProps) => {
  return (
    <View style={{flex: 1}}>
      {room?.hlsStreamingState?.running ? (
        room?.hlsStreamingState?.variants?.slice(0, 1)?.map((variant, index) =>
          variant?.hlsStreamUrl ? (
            <View key={index} style={{flex: 1, position: 'relative'}}>
              <HMSPlayer style={styles.renderHLSVideo} />
            </View>
          ) : (
            <View key={index} style={styles.renderVideo}>
              <Text style={styles.interRegular}>
                Trying to load empty source...
              </Text>
            </View>
          ),
        )
      ) : (
        <View style={styles.renderVideo}>
          <Text style={styles.interRegular}>
            Waiting for the Streaming to start...
          </Text>
        </View>
      )}
    </View>
  );
};
export {HLSView};
