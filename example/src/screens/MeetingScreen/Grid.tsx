import React, {useRef} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import type {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSRTCStatsReport,
  HMSSDK,
  HMSSpeaker,
} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

import {getHmsViewHeight} from '../../utils/functions';
import {styles} from './styles';
import {DisplayTrack} from './DisplayTrack';
import {
  LayoutParams,
  ModalTypes,
  PeerTrackNode,
  TrackType,
} from '../../utils/types';

type GridViewProps = {
  pairedPeers: PeerTrackNode[][];
  speakers: HMSSpeaker[];
  instance: HMSSDK | undefined;
  layout: LayoutParams;
  statsForNerds: boolean;
  rtcStats: HMSRTCStatsReport | undefined;
  remoteAudioStats: any;
  remoteVideoStats: any;
  localAudioStats: HMSLocalAudioStats;
  localVideoStats: HMSLocalVideoStats;
  page: number;
  setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setZoomableTrackId: React.Dispatch<React.SetStateAction<string>>;
};

const GridView = ({
  pairedPeers,
  setPage,
  setModalVisible,
  setZoomableTrackId,
  speakers,
  instance,
  layout,
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
  const speakerIds = speakers?.map(speaker => speaker?.peer?.peerID);

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
      renderItem={({item}: {item: Array<PeerTrackNode>}) => {
        return (
          <View
            key={item[0]?.id}
            style={[
              styles.page,
              {width: Dimensions.get('window').width - left - right},
            ]}>
            {item?.map(view => {
              const type: TrackType =
                view?.track?.source !== 'regular'
                  ? TrackType.SCREEN
                  : view?.peer.isLocal
                  ? TrackType.LOCAL
                  : TrackType.REMOTE;
              if (type === TrackType.SCREEN) {
                return (
                  <View style={styles.flex} key={view.id}>
                    <TouchableWithoutFeedback
                      onPress={() => {
                        console.log('Single Tap');
                        doublePress++;
                        if (doublePress === 2) {
                          console.log('Double Tap');
                          doublePress = 0;
                          setModalVisible(ModalTypes.ZOOM);
                          setZoomableTrackId(view.track?.trackId!);
                        } else {
                          setTimeout(() => {
                            doublePress = 0;
                          }, 500);
                        }
                      }}>
                      <DisplayTrack
                        peerTrackNode={view}
                        videoStyles={styles.generalTile}
                        speakerIds={speakerIds}
                        instance={instance}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                );
              } else {
                return (
                  <View
                    key={view?.id}
                    style={{
                      ...getHmsViewHeight(
                        layout,
                        type,
                        item.length,
                        top,
                        bottom,
                      ),
                    }}>
                    <DisplayTrack
                      peerTrackNode={view}
                      videoStyles={styles.generalTile}
                      speakerIds={speakerIds}
                      instance={instance}
                      layout={layout}
                      setModalVisible={setModalVisible}
                      statsForNerds={statsForNerds}
                      rtcStats={rtcStats}
                      remoteAudioStats={remoteAudioStats}
                      remoteVideoStats={remoteVideoStats}
                      localAudioStats={localAudioStats}
                      localVideoStats={localVideoStats}
                    />
                  </View>
                );
              }
            })}
          </View>
        );
      }}
      numColumns={1}
      keyExtractor={item => item[0]?.id}
    />
  );
};
export {GridView};
