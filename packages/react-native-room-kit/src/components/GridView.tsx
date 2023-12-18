import React, { useRef, useState, useImperativeHandle } from 'react';
import type { ElementRef } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type {
  LayoutChangeEvent,
  LayoutRectangle,
  ViewToken,
} from 'react-native';
import type { HMSView, HMSPeer } from '@100mslive/react-native-hms';
import Animated, { useSharedValue } from 'react-native-reanimated';

import { DefaultModal } from './DefaultModal';
import { SaveScreenshot } from './Modals';
import { TilesContainer } from './TilesContainer';
import type { PeerTrackNode } from '../utils/types';
import { MiniView } from './MiniView';
import type { RootState } from '../redux';
import { PaginationDots } from './PaginationDots';
import { setGridViewActivePage } from '../redux/actions';
import { Tile } from './Tile';
import { useIsLandscapeOrientation } from '../utils/dimension';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

export type GridViewProps = {
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  pairedPeers: PeerTrackNode[][];
};

export type GridViewRefAttrs = {
  captureViewScreenshot(node: PeerTrackNode): any;
  getRegularTilesFlatlistRef(): React.RefObject<FlatList<PeerTrackNode[]>>;
  getScreenshareTilesFlatlistRef(): React.RefObject<
    FlatList<PeerTrackNode>
  > | null;
};

const FLATLIST_VIEWABILITY_CONFIG = {
  waitForInteraction: true,
  itemVisiblePercentThreshold: 80,
};

export const GridView = React.forwardRef<GridViewRefAttrs, GridViewProps>(
  ({ pairedPeers, onPeerTileMorePress }, ref) => {
    const [screenshotData, setScreenshotData] = useState<{
      peer: HMSPeer;
      source: { uri: string };
    } | null>(null);
    const hmsViewRefs = useRef<Record<string, ElementRef<typeof HMSView>>>({});
    const regularTilesFlatlistRef = useRef<FlatList<PeerTrackNode[]>>(null);
    const screenshareTilesFlatlistRef = useRef<FlatList<PeerTrackNode>>(null);
    const [insetTileBoundingBox, setInsetTileBoundingBox] = useState<{
      width: number | null;
      height: number | null;
    }>({ width: null, height: null });

    const isLandscapeOrientation = useIsLandscapeOrientation();
    const screenshareTilesAvailable = useSelector(
      (state: RootState) => state.app.screensharePeerTrackNodes.length > 0
    );
    const miniviewPeerTrackNodeExists = useSelector(
      (state: RootState) => !!state.app.miniviewPeerTrackNode
    );

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
        getRegularTilesFlatlistRef: () => {
          return regularTilesFlatlistRef;
        },
        getScreenshareTilesFlatlistRef: () => {
          return screenshareTilesFlatlistRef;
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

    const _handleLayoutChange = React.useCallback(
      ({ nativeEvent }: LayoutChangeEvent) => {
        setInsetTileBoundingBox({
          width: nativeEvent.layout.width,
          height: nativeEvent.layout.height,
        });
      },
      []
    );

    return (
      <View style={styles.container}>
        <View onLayout={_handleLayoutChange} style={styles.measureLayoutView} />

        {screenshareTilesAvailable ? (
          <ScreenshareTiles
            ref={screenshareTilesFlatlistRef}
            setHmsViewRefs={setHmsViewRefs}
            onPeerTileMorePress={onPeerTileMorePress}
          />
        ) : null}

        {screenshareTilesAvailable && isLandscapeOrientation ? null : (
          <RegularTiles
            ref={regularTilesFlatlistRef}
            pairedPeers={pairedPeers}
            setHmsViewRefs={setHmsViewRefs}
            onPeerTileMorePress={onPeerTileMorePress}
          />
        )}

        {pairedPeers.length > 0 && miniviewPeerTrackNodeExists ? (
          <MiniView
            boundingBoxWidth={insetTileBoundingBox.width}
            boundingBoxHeight={insetTileBoundingBox.height}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  measureLayoutView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export type RegularTilesProps = {
  setHmsViewRefs(viewId: string, ref: typeof HMSView | null): void;
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
  pairedPeers: PeerTrackNode[][];
};

const RegularTiles = React.forwardRef<
  FlatList<PeerTrackNode[]>,
  RegularTilesProps
>(({ pairedPeers, onPeerTileMorePress, setHmsViewRefs }, flatlistRef) => {
  const dispatch = useDispatch();
  const { height: safeHeight } = useSafeAreaFrame();
  const screenshareTilesAvailable = useSelector(
    (state: RootState) => state.app.screensharePeerTrackNodes.length > 0
  );
  const activeIndex = useSelector(
    (state: RootState) => state.app.gridViewActivePage
  );

  const isLandscapeOrientation = useIsLandscapeOrientation();

  const _keyExtractor = React.useCallback((item) => item[0]?.id, []);

  const _handleViewableItemsChanged = React.useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const firstViewable = info.viewableItems[0];

      if (
        firstViewable?.isViewable &&
        typeof firstViewable.index === 'number'
      ) {
        dispatch(setGridViewActivePage(firstViewable.index));
      }
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

  return (
    <View style={{ flex: screenshareTilesAvailable ? undefined : 1 }}>
      <FlatList
        ref={flatlistRef}
        horizontal={true}
        style={{maxHeight: safeHeight}}
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

      {pairedPeers.length > 1 ? (
        <PaginationDots
          list={pairedPeers}
          activeIndex={activeIndex}
          style={
            screenshareTilesAvailable || isLandscapeOrientation
              ? { marginVertical: isLandscapeOrientation ? 4 : 8 }
              : null
          }
        />
      ) : null}
    </View>
  );
});

export type ScreenshareTilesProps = {
  setHmsViewRefs(viewId: string, ref: typeof HMSView | null): void;
  onPeerTileMorePress(peerTrackNode: PeerTrackNode): void;
};

const ScreenshareTiles = React.forwardRef<
  FlatList<PeerTrackNode>,
  ScreenshareTilesProps
>(({ onPeerTileMorePress, setHmsViewRefs }, flatlistRef) => {
  const { width } = useWindowDimensions();
  const isLandscapeOrientation = useIsLandscapeOrientation();
  const [activePage, setActivePage] = useState(0);
  const screensharePeerTrackNodes = useSelector(
    (state: RootState) => state.app.screensharePeerTrackNodes
  );

  const _keyExtractor = React.useCallback((item) => item.id, []);

  const _handleViewableItemsChanged = React.useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const firstViewable = info.viewableItems[0];

      if (
        firstViewable?.isViewable &&
        typeof firstViewable.index === 'number'
      ) {
        setActivePage(firstViewable.index);
      }
    },
    []
  );

  const _renderItem = React.useCallback(
    ({ item }) => {
      return (
        <Tile
          height={'100%'}
          width={width}
          peerTrackNode={item}
          onPeerTileMorePress={onPeerTileMorePress}
          setHmsViewRefs={setHmsViewRefs}
        />
      );
    },
    [width, onPeerTileMorePress, setHmsViewRefs]
  );

  return (
    <View style={{ flex: 1, marginBottom: 4 }}>
      <FlatList
        ref={flatlistRef}
        horizontal={true}
        data={screensharePeerTrackNodes}
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

      {screensharePeerTrackNodes.length > 1 ? (
        <PaginationDots
          list={screensharePeerTrackNodes}
          activeIndex={activePage}
          style={{ marginVertical: isLandscapeOrientation ? 4 : 8 }}
        />
      ) : null}
    </View>
  );
});
