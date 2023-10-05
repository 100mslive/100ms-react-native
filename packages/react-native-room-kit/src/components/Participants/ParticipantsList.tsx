import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { HMSLocalPeer, HMSRemotePeer } from '@100mslive/react-native-hms';

import { useHMSConferencingScreenConfig, useHMSLayoutConfig, useHMSRoomStyle } from '../../hooks-util';
import type {
  ListItemUI,
  ParticipantHandRaisedHeaderData,
  ParticipantHeaderData,
} from '../../hooks-util';
import { ParticipantsItem } from './ParticipantsItem';
import { ParticipantsGroupHeader } from './ParticipantsGroupHeader';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux';
import { ParticipantsAccordian } from './ParticipantsAccordian';

export type ParticipantsListProps = {
  data: any[];
  searchTextExists: boolean;
  expandedGroup: string | null;
  setExpandedGroup: React.Dispatch<React.SetStateAction<string | null>>;
};

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  data,
  searchTextExists,
  expandedGroup,
  setExpandedGroup,
}) => {
  // useHMSConferencingScreenConfig((s) => s?.elements);
  // useHMSLayoutConfig(s => s?.screens?.conferencing?.default?.elements?.on_stage_exp);
  // useHMSLayoutConfig(s => s?.screens?.conferencing?.hls_live_streaming?.elements.);
  const emptyTextStyles = useHMSRoomStyle((theme, typography) => ({
    color: theme.palette.on_surface_medium,
    fontFamily: `${typography.font_family}-SemiBold`,
  }));

  // const _keyExtractor = React.useCallback((item: ListItemUI) => item.key, []);

  // const _renderItem = React.useCallback(
  //   (data: { item: ListItemUI }) => {
  //     if ('label' in data.item.data) {
  //       return (
  //         <ParticipantsGroupHeader
  //           data={
  //             data.item as ListItemUI<
  //               ParticipantHeaderData | ParticipantHandRaisedHeaderData
  //             >
  //           }
  //           setExpandedGroup={setExpandedGroup}
  //         />
  //       );
  //     }

  //     return (
  //       <ParticipantsItem
  //         data={data.item as ListItemUI<HMSLocalPeer | HMSRemotePeer>}
  //       />
  //     );
  //   },
  //   [setExpandedGroup]
  // );

  // const _getItemType = React.useCallback((item: ListItemUI) => item.type, []);

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
    <ScrollView contentContainerStyle={{paddingBottom: 40}}>
      {data.map(item => (
        <ParticipantsAccordian
          key={item.id}
          open={expandedGroup === item.id}
          data={item}
          toggle={setExpandedGroup}
          showViewAll={Array.isArray(item.data) && item.data.length > 10}
        />
      ))}
    </ScrollView>
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
});
