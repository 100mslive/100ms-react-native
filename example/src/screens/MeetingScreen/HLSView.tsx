import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, Text} from 'react-native';
import {HMSPlayer} from '@100mslive/react-native-hms';
import type {HMSRoom} from '@100mslive/react-native-hms';

import {styles} from './styles';

import {RootState} from '../../redux';
import {changeShowHLSStats} from '../../redux/actions';
import {HLSPlayerStatsView} from '../../components/HLSPlayerStatsView';
import {HLSPlayerEmoticons} from '../../components/HLSPlayerEmoticons';

type HLSViewProps = {
  room?: HMSRoom;
};

const HLSView = ({room}: HLSViewProps) => {
  const dispatch = useDispatch();
  const showHLSStats = useSelector(
    (state: RootState) => state.app.joinConfig.showHLSStats,
  );
  const enableHLSPlayerControls = useSelector(
    (state: RootState) => state.app.joinConfig.enableHLSPlayerControls,
  );
  const hlsAspectRatio = useSelector(
    (state: RootState) => state.app.hlsAspectRatio,
  );

  const handleClosePress = () => {
    dispatch(changeShowHLSStats(false));
  };

  return (
    <View style={{flex: 1}}>
      {room?.hlsStreamingState?.running ? (
        room?.hlsStreamingState?.variants?.slice(0, 1)?.map((variant, index) =>
          variant?.hlsStreamUrl ? (
            <View key={index} style={{flex: 1, position: 'relative'}}>
              <HMSPlayer
                aspectRatio={hlsAspectRatio.value}
                enableStats={showHLSStats}
                enableControls={enableHLSPlayerControls}
              />
              <HLSPlayerEmoticons />
              {showHLSStats ? (
                <HLSPlayerStatsView onClosePress={handleClosePress} />
              ) : null}
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
