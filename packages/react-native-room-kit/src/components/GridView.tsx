import React, { useRef, useState, useImperativeHandle } from 'react';
import type { ElementRef } from 'react';
import { View, FlatList } from 'react-native';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import type { HMSView, HMSPeer } from '@100mslive/react-native-hms';

import { DefaultModal } from './DefaultModal';
import { SaveScreenshot } from './Modals';
import { TilesContainer } from './TilesContainer';
import type { PeerTrackNode } from '../utils/types';
import { MiniView } from './MiniView';

export type GridViewProps = {
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  pairedPeers: PeerTrackNode[][];
};

export type GridViewRefAttrs = {
  captureViewScreenshot(node: PeerTrackNode): any;
  getFlatlistRef(): React.RefObject<FlatList<any>>;
};

const GridView = React.forwardRef<GridViewRefAttrs, GridViewProps>(
  ({ pairedPeers, onPeerTileMorePress }, ref) => {
    // hooks
    const [screenshotData, setScreenshotData] = useState<{
      peer: HMSPeer;
      source: { uri: string };
    } | null>(null);
    const hmsViewRefs = useRef<Record<string, ElementRef<typeof HMSView>>>({});
    const flatlistRef = useRef<FlatList>(null);
    const insetTileBoundingBoxRef = useRef<LayoutRectangle | null>(null);

    // We are setting `captureViewScreenshot` method on ref passed to GridView component
    // `captureViewScreenshot` method can be called to with PeerTrackNode to capture the HmsView Snapshot
    useImperativeHandle(
      ref,
      () => ({
        captureViewScreenshot: (node: PeerTrackNode) => {
          // getting HmsView ref for the passed PeerTrackNode
          const hmsViewRef = hmsViewRefs.current[node.id];

          // If HmsView is not rendered on Tile, then HmsView ref will be `undefined`
          if (!hmsViewRef) {
            console.warn(`HmsViewRef for "${node.id}" is not available!`);
            return;
          }

          // Calling `capture` method on HmsView ref
          hmsViewRef
            .capture?.()
            .then((imageBase64: string) => {
              console.log('HmsView Capture Success');
              // Saving data needed to show captured snapshot in "Save Snapshot" Modal
              setScreenshotData({
                peer: node.peer,
                source: { uri: `data:image/png;base64,${imageBase64}` },
              });
            })
            .catch((error: any) =>
              console.warn('HmsView Capture Error: ', error)
            );
        },
        getFlatlistRef: () => {
          return flatlistRef;
        },
      }),
      []
    );

    const setHmsViewRefs = React.useCallback(
      (viewId: string, ref: typeof HMSView | null) => {
        hmsViewRefs.current[viewId] = ref;
      },
      []
    );

    const _renderItem = React.useCallback(
      ({ item }) => {
        return (
          <TilesContainer
            onPeerTileMorePress={onPeerTileMorePress}
            peerTrackNodes={item}
            setHmsViewRefs={setHmsViewRefs}
          />
        );
      },
      [onPeerTileMorePress, setHmsViewRefs]
    );

    const _keyExtractor = React.useCallback((item) => item[0]?.id, []);

    const _handleLayoutChange = React.useCallback(
      ({ nativeEvent }: LayoutChangeEvent) => {
        insetTileBoundingBoxRef.current = nativeEvent.layout;
      },
      []
    );

    return (
      <View onLayout={_handleLayoutChange} style={{ flex: 1 }}>
        <FlatList
          ref={flatlistRef}
          horizontal
          data={pairedPeers}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={_renderItem}
          numColumns={1}
          keyExtractor={_keyExtractor}
        />
        {pairedPeers.length > 0 ? (
          <MiniView
            boundingBoxRef={insetTileBoundingBoxRef}
            onMoreOptionsPress={onPeerTileMorePress}
          />
        ) : null}

        {/* Save Captured Screenshot of HMSView Modal */}
        <DefaultModal
          modalPosiion="center"
          modalVisible={!!screenshotData}
          setModalVisible={() => setScreenshotData(null)}
        >
          <SaveScreenshot
            imageSource={screenshotData?.source}
            cancelModal={() => setScreenshotData(null)}
          />
        </DefaultModal>
      </View>
    );
  }
);

GridView.displayName = 'GridView';

export { GridView };
