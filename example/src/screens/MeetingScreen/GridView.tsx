import React, {ElementRef, useRef, useState, useImperativeHandle} from 'react';
import {View, FlatList, Dimensions, Text, TouchableOpacity} from 'react-native';
import {HMSPeer, HMSTrackSource} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {HMSView} from '@100mslive/react-native-hms';

import {getDisplayTrackDimensions, parseMetadata} from '../../utils/functions';
import {styles} from './styles';
import {DisplayTrack} from './DisplayTrack';
import type {PeerTrackNode} from '../../utils/types';
import { DefaultModal } from '../../components';
import { SaveScreenshot } from './Modals';
import { COLORS } from '../../utils/theme';

type GridViewProps = {
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  pairedPeers: PeerTrackNode[][];
  orientation: boolean;
};

type GridViewRefAttrs = {
  captureViewScreenshot(node: PeerTrackNode): any;
}

const GridView = React.forwardRef<GridViewRefAttrs, GridViewProps>(({pairedPeers, orientation, onPeerTileMorePress}, ref) => {
  // hooks
  const [screenshotData, setScreenshotData] = useState<{peer: HMSPeer; source: { uri: string }} | null>(null);
  const hmsViewRefs = useRef<Record<string, ElementRef<typeof HMSView>>>({});
  const {left, right, top, bottom} = useSafeAreaInsets();

  // useRef hook
  const flatlistRef = useRef<FlatList>(null);

  useImperativeHandle(ref, () => ({
    captureViewScreenshot: (node: PeerTrackNode) => {
      const hmsViewRef = hmsViewRefs.current[node.id];

      if (!hmsViewRef) {
        console.warn(`HmsViewRef for "${node.id}" is not available!`);
        return;
      }

      hmsViewRef.capture?.()
        .then((imageBase64: string) => {
          console.log('HmsView Cature Success');
          setScreenshotData({
            peer: node.peer,
            source: { uri: `data:image/png;base64,${imageBase64}` }
          });
        })
        .catch((error: any) => console.warn('HmsView Cature Error: ', error));
    }
  }), []);

  return (
    <View>
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
                        ? styles.gridTile
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
                      ref={(ref) => hmsViewRefs.current[view.id] = ref}
                      isLocal={view?.peer?.isLocal}
                      peerName={view?.peer?.name}
                      videoTrack={view?.track}
                      videoStyles={styles.generalTile}
                      isDegraded={view?.isDegraded}
                    />

                    <View style={styles.morePeerOptionsContainer}>
                      <TouchableOpacity onPress={() => onPeerTileMorePress(view)} style={{ padding: 8, backgroundColor: COLORS.SECONDARY.DISABLED, borderRadius: 18 }}>
                        <Feather name="more-horizontal" style={styles.mic} size={20} />
                      </TouchableOpacity>
                    </View>

                    {view?.peer?.audioTrack?.isMute() && (
                      <View style={styles.micContainer}>
                        <Feather name="mic-off" style={styles.mic} size={20} />
                      </View>
                    )}
                    {/* TODO: add hand raise icon */}
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

      <DefaultModal
        animationType="fade"
        overlay={false}
        modalPosiion="center"
        modalVisible={!!screenshotData}
        setModalVisible={() => setScreenshotData(null)}
      >
        <SaveScreenshot
          screenshotData={screenshotData}
          cancelModal={() => setScreenshotData(null)}
        />
      </DefaultModal>
    </View>
  );
});

GridView.displayName = 'GridView';

export {GridView};
