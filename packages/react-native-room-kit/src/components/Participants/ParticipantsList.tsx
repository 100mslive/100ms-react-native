import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { HMSPeer } from '@100mslive/react-native-hms';

import {
  useHMSInstance,
  useHMSLayoutConfig,
  useHMSRoomStyleSheet,
} from '../../hooks-util';
import { ParticipantsItem } from './ParticipantsItem';
import { ParticipantsGroupHeader } from './ParticipantsGroupHeader';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux';
import { ParticipantsListFooter } from './ParticipantsListFooter';

export type ParticipantsListProps = {
  searchText: string;
  selectedGroupId: string;
  onBackPress(): void;
};

const stickyIndices = [0];

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  searchText,
  selectedGroupId,
  onBackPress,
}) => {
  const mountedRef = React.useRef(true);
  const fetchedInitialDataRef = React.useRef(false);
  const hmsInstance = useHMSInstance();

  // Current is current selected group and off-stage group
  const isOffStageGroup = useHMSLayoutConfig((layoutConfig) => {
    const offStageRoles =
      layoutConfig?.screens?.conferencing?.default?.elements?.on_stage_exp
        ?.off_stage_roles || null;
    return offStageRoles ? offStageRoles.includes(selectedGroupId) : false;
  });

  // Getting initial data for the selected group ID
  const dataForGroupId = useSelector((state: RootState) => {
    return selectedGroupId === 'hand-raised'
      ? state.hmsStates.groupedParticipants
      : state.hmsStates.groupedParticipants[selectedGroupId];
  });

  const finalDataForGroupId = React.useMemo(() => {
    if (Array.isArray(dataForGroupId)) {
      return dataForGroupId;
    }

    if (dataForGroupId && selectedGroupId === 'hand-raised') {
      return Object.values(dataForGroupId)
        .flat()
        .filter((peer) => peer.isHandRaised);
    }

    return null;
  }, [dataForGroupId, selectedGroupId]);

  // Creating Header Data
  const headerData = React.useMemo(() => {
    return {
      id: selectedGroupId,
      label:
        selectedGroupId === 'hand-raised' ? 'Hand Raised' : selectedGroupId,
    };
  }, [selectedGroupId]);

  // Created List with Header Data as first item in list
  const dataWithHeader = React.useMemo(
    () => [headerData, ...(finalDataForGroupId ?? [])],
    [finalDataForGroupId, headerData]
  );

  const [offStageData, setOffStageData] = React.useState(dataWithHeader);
  const [loading, setLoading] = React.useState(false);

  // Created Peer List Iterator for current selected group if it is an 'off-stage' group
  const peerListIterator = React.useMemo(() => {
    if (!isOffStageGroup) {
      return null;
    }
    return hmsInstance.getPeerListIterator({
      limit: 20,
      byRoleName: selectedGroupId,
    });
  }, [selectedGroupId, isOffStageGroup, hmsInstance]);

  // #Effect: Fetching first page from Peer List Iterator
  React.useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    if (peerListIterator) {
      setLoading(true);

      peerListIterator
        .next()
        .then((peers: HMSPeer[]) => {
          if (mounted) {
            setLoading(false);
            setOffStageData([headerData, ...peers]);
            fetchedInitialDataRef.current = true;
          }
        })
        .catch(() => {
          if (mounted) {
            setLoading(false);
          }
        });
    }

    return () => {
      mounted = false;
      mountedRef.current = false;
    };
  }, [headerData, peerListIterator]);

  const filteredSearchText = searchText.trim().toLowerCase();

  //#region FlashList props
  const data = React.useMemo(() => {
    return (isOffStageGroup ? offStageData : dataWithHeader).filter((item) =>
      'id' in item
        ? true
        : item.name?.toLowerCase().includes(filteredSearchText)
    );
  }, [filteredSearchText, offStageData, dataWithHeader, isOffStageGroup]);

  const _keyExtractor = React.useCallback(
    (item: HMSPeer | { id: string; label: string }) =>
      'id' in item ? item.id : item.peerID,
    []
  );

  const _renderItem = React.useCallback(
    (data: { item: HMSPeer | { id: string; label: string } }) => {
      if ('id' in data.item) {
        return (
          <View style={hmsRoomStyles.stickyHeader}>
            <View style={[styles.headerWrapper, hmsRoomStyles.stickyHeader]}>
              <ParticipantsGroupHeader
                id={data.item.id}
                label={data.item.label}
                expanded={true}
                onBackPress={onBackPress}
              />
            </View>
          </View>
        );
      }

      return (
        <View style={[styles.itemWrapper, hmsRoomStyles.item]}>
          <ParticipantsItem groupId={selectedGroupId} data={data.item} />
        </View>
      );
    },
    [selectedGroupId]
  );

  const _getItemType = React.useCallback(
    (item: HMSPeer | { id: string; label: string }) =>
      'id' in item ? 'header' : 'item',
    []
  );

  const _onEndReached = React.useCallback(() => {
    if (loading || !fetchedInitialDataRef.current || !mountedRef.current) {
      return;
    }

    if (peerListIterator) {
      setLoading(true);
      peerListIterator
        .next()
        .then((peers: HMSPeer[]) => {
          if (mountedRef.current) {
            setLoading(false);
            setOffStageData((prev) => [...prev, ...peers]);
          }
        })
        .catch(() => {
          if (mountedRef.current) {
            setLoading(false);
          }
        });
    }
  }, [loading, peerListIterator]);
  //#endregion FlashList props

  const searchTextExists = searchText.length > 0;

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    emptyText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    stickyHeader: {
      backgroundColor: theme.palette.surface_dim,
      borderColor: theme.palette.border_bright,
    },
    item: {
      borderColor: theme.palette.border_bright,
    },
  }));

  if (!data || (searchTextExists && data.length <= 1)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, hmsRoomStyles.emptyText]}>
          No results found...
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={data}
      estimatedItemSize={56}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="always"
      ListFooterComponent={<ParticipantsListFooter loading={loading} />}
      stickyHeaderIndices={stickyIndices}
      keyExtractor={_keyExtractor}
      renderItem={_renderItem}
      getItemType={_getItemType}
      onEndReached={
        searchTextExists || !peerListIterator ? null : _onEndReached
      }
      onEndReachedThreshold={0.8}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  headerWrapper: {
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  itemWrapper: {
    borderRightWidth: 1,
    borderLeftWidth: 1,
  },
});
