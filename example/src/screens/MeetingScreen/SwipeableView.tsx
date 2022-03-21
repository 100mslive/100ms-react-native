import React, {useRef} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import {
  HMSLocalAudioStats,
  HMSLocalVideoStats,
  HMSPermissions,
  HMSRemotePeer,
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

type SwipeableViewProps = {
  pairedPeers: Peer[][];
  setPage: React.Dispatch<React.SetStateAction<number>>;
  Dimensions: Dimensions;
  setZoomableModal: React.Dispatch<React.SetStateAction<boolean>>;
  setZoomableTrackId: React.Dispatch<React.SetStateAction<string>>;
  getAuxVideoStyles: Function;
  getRemoteVideoStyles: Function;
  speakerIds: string[];
  instance: HMSSDK | undefined;
  localPeerPermissions: HMSPermissions | undefined;
  layout: LayoutParams;
  state: RootState;
  setChangeNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  statsForNerds: boolean;
  rtcStats: HMSRTCStatsReport | undefined;
  remoteAudioStats: any;
  remoteVideoStats: any;
  localAudioStats: HMSLocalAudioStats;
  localVideoStats: HMSLocalVideoStats;
  page: number;
  setRemoteTrackIds: React.Dispatch<React.SetStateAction<Peer[]>>;
  decodeRemotePeer: Function;
  hmsInstance: HMSSDK | undefined;
};

const SwipeableView = ({
  pairedPeers,
  setPage,
  Dimensions,
  setZoomableModal,
  setZoomableTrackId,
  getAuxVideoStyles,
  speakerIds,
  instance,
  localPeerPermissions,
  layout,
  getRemoteVideoStyles,
  state,
  setChangeNameModal,
  statsForNerds,
  rtcStats,
  remoteAudioStats,
  remoteVideoStats,
  localAudioStats,
  localVideoStats,
  page,
  setRemoteTrackIds,
  decodeRemotePeer,
  hmsInstance,
}: SwipeableViewProps) => {
  const {left, right, top, bottom} = useSafeAreaInsets();
  const flatlistRef = useRef<FlatList>(null);
  var doublePress = 0;
  if (page + 1 > pairedPeers.length) {
    flatlistRef?.current?.scrollToEnd();
  }

  const onViewRef = React.useRef(({viewableItems}: any) => {
    if (viewableItems) {
      const viewableItemsIds: (string | undefined)[] = [];
      viewableItems.map(
        (viewableItem: {
          index: number;
          item: Array<Peer>;
          key: string;
          isViewable: boolean;
        }) => {
          viewableItem?.item?.map((item: Peer) => {
            viewableItemsIds.push(item?.trackId);
          });
        },
      );

      const inst = hmsInstance;
      const remotePeers = inst?.remotePeers;
      if (remotePeers) {
        const sinkRemoteTrackIds = remotePeers.map(
          (peer: HMSRemotePeer, index: number) => {
            const remotePeer = decodeRemotePeer(peer, 'remote');
            const videoTrackId = remotePeer.trackId;
            if (videoTrackId) {
              if (!viewableItemsIds?.includes(videoTrackId)) {
                return {
                  ...remotePeer,
                  sink: false,
                };
              }
              return remotePeer;
            } else {
              return {
                ...remotePeer,
                trackId: index.toString(),
                sink: false,
                isVideoMute: true,
              };
            }
          },
        );
        setRemoteTrackIds(sinkRemoteTrackIds ? sinkRemoteTrackIds : []);
      }
    }
  });

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
                      videoStyles={getRemoteVideoStyles}
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
      onViewableItemsChanged={onViewRef.current}
      keyExtractor={item => item[0]?.id}
    />
  );
};
export {SwipeableView};
