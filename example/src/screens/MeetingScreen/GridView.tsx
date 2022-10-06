import React, {useRef} from 'react';
import {View, FlatList, Dimensions} from 'react-native';
import {HMSTrackSource} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {getHmsViewHeight} from '../../utils/functions';
import {styles} from './styles';
import {DisplayTrack} from './DisplayTrack';
import {LayoutParams, PeerTrackNode} from '../../utils/types';

type GridViewProps = {
  pairedPeers: PeerTrackNode[][];
};

const GridView = ({pairedPeers}: GridViewProps) => {
  // hooks
  const {left, right, top, bottom} = useSafeAreaInsets();
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
                    view?.track?.source === HMSTrackSource.SCREEN
                      ? styles.flex
                      : {
                          ...getHmsViewHeight(
                            LayoutParams.GRID,
                            item.length,
                            top,
                            bottom,
                            true,
                          ),
                        },
                  ]}
                  key={view.id}>
                  <DisplayTrack
                    isLocal={view?.peer?.isLocal}
                    peerName={view?.peer?.name}
                    videoTrack={view?.track}
                    videoStyles={styles.generalTile}
                  />
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
