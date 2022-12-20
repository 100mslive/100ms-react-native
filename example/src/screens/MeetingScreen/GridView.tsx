import React, {useRef} from 'react';
import {View, FlatList, Dimensions, Text} from 'react-native';
import {HMSTrackSource} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import {getDisplayTrackDimensions, parseMetadata} from '../../utils/functions';
import {styles} from './styles';
import {DisplayTrack} from './DisplayTrack';
import type {PeerTrackNode} from '../../utils/types';

type GridViewProps = {
  pairedPeers: PeerTrackNode[][];
  orientation: boolean;
};

const GridView = ({pairedPeers, orientation}: GridViewProps) => {
  // hooks
  const {left, right, top, bottom} = useSafeAreaInsets();

  // useRef hook
  const flatlistRef = useRef<FlatList>(null);

  return (
    <FlatList
      ref={flatlistRef}
      horizontal
      data={pairedPeers}
      initialNumToRender={2}
      maxToRenderPerBatch={3}
      //   onScroll={({nativeEvent}) => {
      //     const {contentOffset, layoutMeasurement} = nativeEvent;
      //     setPage(contentOffset.x / layoutMeasurement.width);
      //   }}
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      renderItem={(data: {item: Array<PeerTrackNode>; index: number}) => {
        const {item, index} = data;
        return (
          <View
            key={index}
            style={[
              styles.page,
              {width: Dimensions.get('window').width - left - right},
            ]}>
            {item?.map(view => {
              return (
                <View
                  style={[
                    view?.track?.source !== undefined &&
                    view?.track?.source !== HMSTrackSource.REGULAR
                      ? styles.flex
                      : {
                          ...getDisplayTrackDimensions(
                            item.length,
                            top,
                            bottom,
                            orientation,
                          ),
                        },
                  ]}
                  key={view.id}>
                  <DisplayTrack
                    isLocal={view?.peer?.isLocal}
                    peer={view?.peer}
                    videoTrack={view?.track}
                    videoStyles={styles.generalTile}
                    isDegraded={view?.isDegraded}
                  />
                  {view?.peer?.audioTrack?.isMute() && (
                    <View style={styles.micContainer}>
                      <Feather name="mic-off" style={styles.mic} size={20} />
                    </View>
                  )}
                  {parseMetadata(view?.peer?.metadata)?.isBRBOn && (
                    <View style={styles.status}>
                      <View style={styles.brbOnContainer}>
                        <Text style={styles.brbOn}>BRB</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
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
