import React, {useRef} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import type {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSPermissions,
  HMSRTCStatsReport,
  HMSSDK,
} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

import {getHmsViewHeight} from '../../utils/functions';
import {styles} from './styles';
import {DisplayTrack} from './DisplayTrack';
import type {RootState} from '../../redux';
import type {Peer, LayoutParams} from '../../utils/types';

type GridViewProps = {
  pairedPeers: Peer[][];
  getAuxVideoStyles: Function;
  speakerIds: string[];
  instance: HMSSDK | undefined;
  localPeerPermissions: HMSPermissions | undefined;
  layout: LayoutParams;
  state: RootState;
  statsForNerds: boolean;
  rtcStats: HMSRTCStatsReport | undefined;
  remoteAudioStats: any;
  remoteVideoStats: any;
  localAudioStats: HMSLocalAudioStats;
  localVideoStats: HMSLocalVideoStats;
  page: number;
  setChangeNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setZoomableModal: React.Dispatch<React.SetStateAction<boolean>>;
  setZoomableTrackId: React.Dispatch<React.SetStateAction<string>>;
};

const GridView = ({
  pairedPeers,
  setPage,
  setZoomableModal,
  setZoomableTrackId,
  getAuxVideoStyles,
  speakerIds,
  instance,
  localPeerPermissions,
  layout,
  state,
  setChangeNameModal,
  statsForNerds,
  rtcStats,
  remoteAudioStats,
  remoteVideoStats,
  localAudioStats,
  localVideoStats,
  page,
}: GridViewProps) => {
  const {left, right, top, bottom} = useSafeAreaInsets();
  const flatlistRef = useRef<FlatList>(null);
  var doublePress = 0;
  if (page + 1 > pairedPeers.length) {
    flatlistRef?.current?.scrollToEnd();
  }

  return (
    <FlatList
      ref={flatlistRef}
      horizontal
      data={pairedPeers}
      initialNumToRender={2}
      maxToRenderPerBatch={3}
      onScroll={({nativeEvent}) => {
        const {contentOffset, layoutMeasurement} = nativeEvent;
        setPage(contentOffset.x / layoutMeasurement.width);
      }}
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={({item}) => {
        return (
          <View
            key={item[0]?.trackId}
            style={[
              styles.page,
              {width: Dimensions.get('window').width - left - right},
            ]}>
            {item?.map(
              (view: Peer) =>
                view?.id &&
                (view.type === 'screen' ? (
                  <View style={styles.flex} key={view?.id}>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        console.log('Single Tap');
                        doublePress++;
                        if (doublePress === 2) {
                          console.log('Double Tap');
                          doublePress = 0;
                          setZoomableModal(true);
                          setZoomableTrackId(view.trackId!);
                        } else {
                          setTimeout(() => {
                            doublePress = 0;
                          }, 500);
                        }
                      }}>
                      <DisplayTrack
                        peer={view}
                        videoStyles={getAuxVideoStyles}
                        speakerIds={speakerIds}
                        instance={instance}
                        type={view.type}
                        permissions={localPeerPermissions}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                ) : (
                  <View
                    key={view?.id}
                    style={{
                      ...getHmsViewHeight(
                        layout,
                        view.type,
                        item.length,
                        top,
                        bottom,
                      ),
                    }}>
                    <DisplayTrack
                      peer={view}
                      videoStyles={() => styles.generalTile}
                      speakerIds={speakerIds}
                      instance={instance}
                      type={view.type}
                      permissions={localPeerPermissions}
                      layout={layout}
                      mirrorLocalVideo={state.user.mirrorLocalVideo}
                      setChangeNameModal={setChangeNameModal}
                      statsForNerds={statsForNerds}
                      rtcStats={rtcStats}
                      remoteAudioStats={remoteAudioStats}
                      remoteVideoStats={remoteVideoStats}
                      localAudioStats={localAudioStats}
                      localVideoStats={localVideoStats}
                    />
                  </View>
                )),
            )}
          </View>
        );
      }}
      numColumns={1}
      keyExtractor={item => item[0]?.id}
    />
  );
};
export {GridView};
