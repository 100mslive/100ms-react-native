import React, { useRef, useState, useImperativeHandle } from 'react';
import type { ElementRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { LayoutChangeEvent, LayoutRectangle, ViewToken } from 'react-native';
import type { HMSView, HMSPeer } from '@100mslive/react-native-hms';

import { DefaultModal } from './DefaultModal';
import { SaveScreenshot } from './Modals';
import { TilesContainer } from './TilesContainer';
import type { PeerTrackNode } from '../utils/types';
import { MiniView } from './MiniView';
import type { RootState } from '../redux';
import { PaginationDots } from './PaginationDots';
import { setGridViewActivePage } from '../redux/actions';

export type GridViewProps = {
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  pairedPeers: PeerTrackNode[][];
};

export type GridViewRefAttrs = {
  captureViewScreenshot(node: PeerTrackNode): any;
  getFlatlistRef(): React.RefObject<FlatList<any>>;
};

const FLATLIST_VIEWABILITY_CONFIG = {
  waitForInteraction: true,
  itemVisiblePercentThreshold: 80
};

export const GridView = React.forwardRef<GridViewRefAttrs, GridViewProps>(
  ({ pairedPeers, onPeerTileMorePress }, ref) => {
    const dispatch = useDispatch();
    const [screenshotData, setScreenshotData] = useState<{
      peer: HMSPeer;
      source: { uri: string };
    } | null>(null);
    const hmsViewRefs = useRef<Record<string, ElementRef<typeof HMSView>>>({});
    const flatlistRef = useRef<FlatList>(null);
    const insetTileBoundingBoxRef = useRef<LayoutRectangle | null>(null);
    const miniviewPeerTrackNodeExists = useSelector((state: RootState) => !!state.app.miniviewPeerTrackNode);

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

    const _handleViewableItemsChanged = React.useCallback((info: {
      viewableItems: ViewToken[];
      changed: ViewToken[];
    }) => {
      const firstViewable = info.viewableItems[0];

      if (firstViewable?.isViewable && (typeof firstViewable.index === 'number')) {
        dispatch(setGridViewActivePage(firstViewable.index));
      }
    }, []);

    return (
      <View  style={styles.container}>
        <View style={styles.tilesArea}>
          <View onLayout={_handleLayoutChange} style={styles.measureLayoutView} />

          <FlatList
            ref={flatlistRef}
            horizontal={true}
            data={pairedPeers}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={2}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={_renderItem}
            numColumns={1}
            keyExtractor={_keyExtractor}
            onViewableItemsChanged={_handleViewableItemsChanged}
            viewabilityConfig={FLATLIST_VIEWABILITY_CONFIG}
          />

          {pairedPeers.length > 0 && miniviewPeerTrackNodeExists ? (
            <MiniView
              boundingBoxRef={insetTileBoundingBoxRef}
              onMoreOptionsPress={onPeerTileMorePress}
            />
          ) : null}
        </View>

        {pairedPeers.length > 1 ? (
          <PaginationDots list={pairedPeers} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tilesArea: {
    flex: 1,
    position: 'relative'
  },
  measureLayoutView: {
    position:'absolute',
    width: '100%',
    height: '100%'
  }
});
