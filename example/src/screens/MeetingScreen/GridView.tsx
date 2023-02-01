import React, {ElementRef, useRef, useState, useImperativeHandle} from 'react';
import {View, FlatList, Dimensions, Text, TouchableOpacity} from 'react-native';
import {HMSPeer, HMSTrackSource} from '@100mslive/react-native-hms';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import type {HMSView} from '@100mslive/react-native-hms';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

  // We are setting `captureViewScreenshot` method on ref passed to GridView component
  // `captureViewScreenshot` method can be called to with PeerTrackNode to capture the HmsView Snapshot
  useImperativeHandle(ref, () => ({
    captureViewScreenshot: (node: PeerTrackNode) => {
      // getting HmsView ref for the passed PeerTrackNode
      const hmsViewRef = hmsViewRefs.current[node.id];

      // If HmsView is not rendered on Tile, then HmsView ref will be `undefined`
      if (!hmsViewRef) {
        console.warn(`HmsViewRef for "${node.id}" is not available!`);
        return;
      }

      // Calling `capture` method on HmsView ref
      hmsViewRef.capture?.()
        .then((imageBase64: string) => {
          console.log('HmsView Cature Success');
          // Saving data needed to show captured snapshot in "Save Snapshot" Modal
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
                const parsedMetadata = parseMetadata(view?.peer?.metadata);
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
                      // saving HmsView ref in collection with uniqueId as key
                      ref={(ref) => hmsViewRefs.current[view.id] = ref}
                      isLocal={view?.peer?.isLocal}
                      peerName={view?.peer?.name}
                      videoTrack={view?.track}
                      videoStyles={styles.generalTile}
                      isDegraded={view?.isDegraded}
                    />

                    {/* More Options button for Peer */}
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
                    {parsedMetadata?.isBRBOn ? (
                      <View style={styles.status}>
                        <View style={styles.brbOnContainer}>
                          <Text style={styles.brbOn}>BRB</Text>
                        </View>
                      </View>
                    ) : null}
                    {parsedMetadata?.isHandRaised ? (
                      <View style={styles.status}>
                        <Ionicons
                          name="hand-left"
                          style={{ color: COLORS.TWIN.YELLOW }}
                          size={20}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          );
        }}
        numColumns={1}
        keyExtractor={item => item[0]?.id}
      />

      {/* Save Captured Screenshot of HMSView Modal */}
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
