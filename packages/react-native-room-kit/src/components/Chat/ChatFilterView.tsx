import * as React from 'react';
import type { HMSRemotePeer } from '@100mslive/react-native-hms';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useHMSInstance, useHMSRoomStyleSheet } from '../../hooks-util';
import type { RootState } from '../../redux';
import { BottomSheet } from '../BottomSheet';
import { HMSTextInput } from '../HMSTextInput';
import { COLORS } from '../../utils/theme';
import { ParticipantsIcon, SearchIcon } from '../../Icons';
import { ChatFilterItem } from './ChatFilterItem';
import { setChatFilterSheetVisible } from '../../redux/actions';
import { ChatBroadcastFilter } from '../../utils/types';

interface ChatFilterViewProps {}

const _ChatFilterView: React.FC<ChatFilterViewProps> = () => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const filter = useSelector((state: RootState) => state.chatWindow.sendTo);
  const roles = useSelector((state: RootState) => state.hmsStates.roles);
  const [loadingPeersList, setLoadingPeersList] = React.useState(false);
  const [remotePeers, setRemotePeers] = React.useState<HMSRemotePeer[]>([]);
  const [filterText, setFilterText] = React.useState('');

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    textInputContainer: {
      backgroundColor: theme.palette.surface_dim,
      borderColor: theme.palette.border_bright,
    },
    placeholderText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    label: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  React.useEffect(() => {
    let mounted = true;

    const fetchRemotePeers = async () => {
      setLoadingPeersList(true);
      const fetchedRemotePeers = await hmsInstance.getRemotePeers();
      if (mounted) {
        setLoadingPeersList(false);
        setRemotePeers(fetchedRemotePeers);
      }
    };

    fetchRemotePeers();

    return () => {
      mounted = false;
    };
  }, [hmsInstance]);

  const _keyExtractor = React.useCallback(
    (item: HMSRemotePeer) => item.peerID,
    []
  );

  const _renderItem: ListRenderItem<HMSRemotePeer> = React.useCallback(
    ({ item, extraData }) => (
      <ChatFilterItem
        item={item}
        active={extraData.name === item.name}
        disabled={extraData.name === item.name}
      />
    ),
    []
  );

  const closeFiltersBottomSheet = () => {
    dispatch(setChatFilterSheetVisible(false));
  };

  const formattedFilterText = filterText.trim().toLowerCase();

  // Filtering Peers
  const filteredRemotePeers = React.useMemo(() => {
    if (formattedFilterText.length <= 0) {
      return remotePeers;
    }

    return remotePeers.filter((remotePeer) =>
      remotePeer.name.toLowerCase().includes(formattedFilterText)
    );
  }, [formattedFilterText, remotePeers]);

  // Filtering Broadcast option
  const showBroadcastOption =
    formattedFilterText.length > 0
      ? ChatBroadcastFilter.name.includes(formattedFilterText)
      : true;

  // Filtering Roles
  const foundRoles = roles.filter((role) => {
    if (!role.name || role.name.startsWith('_')) {
      return false;
    }

    return formattedFilterText.length > 0
      ? role.name.toLowerCase().includes(formattedFilterText)
      : true;
  });

  const isBroadcastFilterSelected =
    !('publishSettings' in filter || 'peerId' in filter) && // filter is not HMSRole and HMSRemotePeer
    filter.name === ChatBroadcastFilter.name;

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet.Header
        heading="Send Message to"
        dismissModal={closeFiltersBottomSheet}
      />

      <BottomSheet.Divider style={styles.headerDivider} />

      <HMSTextInput
        value={filterText}
        onChangeText={setFilterText}
        placeholder="Search for participants"
        containerStyle={[
          styles.textInputContainer,
          hmsRoomStyles.textInputContainer,
        ]}
        focusedContainerStyle={styles.textInputFocusedContainer}
        placeholderTextColor={COLORS.SURFACE.ON_SURFACE.MEDIUM}
        leftIcon={<SearchIcon style={styles.textInputSearchIcon} />}
      />

      <FlashList
        data={filteredRemotePeers}
        extraData={filter}
        estimatedItemSize={104}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="always"
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
        ListEmptyComponent={
          <View style={styles.placeholderContainer}>
            <Text
              style={[styles.placeholderText, hmsRoomStyles.placeholderText]}
            >
              {loadingPeersList
                ? 'Loading Participants...'
                : formattedFilterText.length > 0
                ? 'No participants found!'
                : 'There is no one in the session!'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View>
            {showBroadcastOption ? (
              <>
                <ChatFilterItem
                  item={ChatBroadcastFilter}
                  active={isBroadcastFilterSelected}
                  disabled={isBroadcastFilterSelected}
                  icon={<ParticipantsIcon />}
                />
                <BottomSheet.Divider style={styles.divider} />
              </>
            ) : null}

            {foundRoles.length > 0 ? (
              <View>
                <Text style={[styles.label, hmsRoomStyles.label]}>ROLES</Text>
                {foundRoles.map((role) => {
                  const isRoleSelected = 'publishSettings' in filter;
                  const isActive = isRoleSelected && filter.name === role.name;

                  return (
                    <ChatFilterItem
                      key={role.name}
                      item={role}
                      active={isActive}
                      disabled={isActive}
                    />
                  );
                })}
                <BottomSheet.Divider style={styles.divider} />
              </View>
            ) : null}

            <Text style={[styles.label, hmsRoomStyles.label]}>
              PARTICIPANTS
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerDivider: {
    marginVertical: 12,
  },
  textInputContainer: {
    borderWidth: 1,
    flex: 0,
    marginHorizontal: 24,
    height: 48,
    paddingHorizontal: 16,
  },
  textInputFocusedContainer: {
    borderWidth: 1,
  },
  textInputSearchIcon: {
    marginRight: 8,
    alignSelf: 'center',
  },
  list: {
    paddingBottom: 32,
  },
  placeholderContainer: {
    marginTop: 24,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 0,
  },
  label: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    marginHorizontal: 32,
    marginTop: 16,
  },
});

export const ChatFilterView = React.memo(_ChatFilterView);
