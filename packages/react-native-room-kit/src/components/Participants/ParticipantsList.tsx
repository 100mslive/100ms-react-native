import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { HMSLocalPeer, HMSRemotePeer } from '@100mslive/react-native-hms';

import { useHMSRoomStyle } from '../../hooks-util';
import type {
  ListItemUI,
  ParticipantHandRaisedHeaderData,
  ParticipantHeaderData,
} from '../../hooks-util';
import { ParticipantsItem } from './ParticipantsItem';
import { ParticipantsGroupHeader } from './ParticipantsGroupHeader';

export type ParticipantsListProps = {
  data: ListItemUI[];
  searchTextExists: boolean;
  setExpandedGroups: React.Dispatch<React.SetStateAction<string[]>>;
};

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  data,
  searchTextExists,
  setExpandedGroups,
}) => {
  const emptyTextStyles = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_medium,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  const _keyExtractor = React.useCallback((item: ListItemUI) => item.key, []);

  const _renderItem = React.useCallback(
    (data: { item: ListItemUI }) => {
      if ('label' in data.item.data) {
        return (
          <ParticipantsGroupHeader
            data={
              data.item as ListItemUI<
                ParticipantHeaderData | ParticipantHandRaisedHeaderData
              >
            }
            setExpandedGroups={setExpandedGroups}
          />
        );
      }

      return (
        <ParticipantsItem
          data={data.item as ListItemUI<HMSLocalPeer | HMSRemotePeer>}
        />
      );
    },
    [setExpandedGroups]
  );

  const _getItemType = React.useCallback((item: ListItemUI) => item.type, []);

  if (searchTextExists && data.length <= 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, emptyTextStyles]}>
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
      keyExtractor={_keyExtractor}
      renderItem={_renderItem}
      getItemType={_getItemType}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 32
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
});
