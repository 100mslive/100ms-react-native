import * as React from 'react';
import type { HMSRemotePeer } from '@100mslive/react-native-hms';
import type { ListRenderItem } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import { StyleSheet, Text, View } from 'react-native';
import { HMSPeerType } from '@100mslive/react-native-hms';
import { useDispatch, useSelector } from 'react-redux';

import {
  useHMSChatRecipientSelector,
  useHMSInstance,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../../hooks-util';
import type { RootState } from '../../redux';
import { BottomSheet } from '../BottomSheet';
import { HMSTextInput } from '../HMSTextInput';
import { ParticipantsIcon, SearchIcon } from '../../Icons';
import { ChatFilterItem } from './ChatFilterItem';
import { setChatFilterSheetVisible } from '../../redux/actions';
import { ChatBroadcastFilter } from '../../utils/types';

interface ChatFilterViewProps {
  onDismiss?: () => void;
}

const _ChatFilterView: React.FC<ChatFilterViewProps> = ({ onDismiss }) => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const filter = useSelector((state: RootState) => state.chatWindow.sendTo);
  const [loadingPeersList, setLoadingPeersList] = React.useState(false);
  const [remotePeers, setRemotePeers] = React.useState<HMSRemotePeer[]>([]);
  const [filterText, setFilterText] = React.useState('');
  const {
    privateChat,
    publicChat,
    roles: rolesSpecificChat,
  } = useHMSChatRecipientSelector();

  const { on_surface_medium: onSurfaceMediumColor } = useHMSRoomColorPalette();

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
    if (privateChat) {
      let mounted = true;

      const fetchRemotePeers = async () => {
        setLoadingPeersList(true);
        const fetchedRemotePeers = await hmsInstance.getRemotePeers();
        if (mounted) {
          setLoadingPeersList(false);
          setRemotePeers(
            fetchedRemotePeers.filter((rp) => rp.type !== HMSPeerType.SIP)
          );
        }
      };

      fetchRemotePeers();

      return () => {
        mounted = false;
      };
    }
  }, [privateChat, hmsInstance]);

  const _keyExtractor = React.useCallback(
    (item: HMSRemotePeer) => item.peerID,
    []
  );

  const _renderItem: ListRenderItem<HMSRemotePeer> = React.useCallback(
    ({ item, extraData }) => (
      <ChatFilterItem
        item={item}
        active={extraData && extraData.name === item.name}
        disabled={extraData && extraData.name === item.name}
        onDismiss={onDismiss}
      />
    ),
    [onDismiss]
  );

  const closeFiltersBottomSheet = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      dispatch(setChatFilterSheetVisible(false));
    }
  };

  const formattedFilterText = filterText.trim().toLowerCase();

  // Filtering Peers
  const filteredRemotePeers = React.useMemo(() => {
    if (formattedFilterText.length <= 0) {
      return remotePeers;
    }

    return remotePeers.filter((remotePeer) =>
      remotePeer.name?.toLowerCase().includes(formattedFilterText)
    );
  }, [formattedFilterText, remotePeers]);

  // Filtering Broadcast option
  const showBroadcastOption = publicChat
    ? formattedFilterText.length > 0
      ? ChatBroadcastFilter.name.includes(formattedFilterText)
      : true
    : false;

  const isBroadcastFilterSelected =
    filter !== null &&
    !('publishSettings' in filter || 'peerId' in filter) && // filter is not HMSRole and HMSRemotePeer
    filter.name === ChatBroadcastFilter.name;

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet.Header
        heading="Send Message to"
        dismissModal={closeFiltersBottomSheet}
      />

      <BottomSheet.Divider style={styles.headerDivider} />

      {privateChat ? (
        <HMSTextInput
          value={filterText}
          onChangeText={setFilterText}
          placeholder="Search for participants"
          containerStyle={[
            styles.textInputContainer,
            hmsRoomStyles.textInputContainer,
          ]}
          focusedContainerStyle={styles.textInputFocusedContainer}
          placeholderTextColor={onSurfaceMediumColor}
          leftIcon={<SearchIcon style={styles.textInputSearchIcon} />}
        />
      ) : null}

      <FlashList
        data={filteredRemotePeers}
        extraData={filter}
        estimatedItemSize={104}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="always"
        keyExtractor={_keyExtractor}
        renderItem={_renderItem}
        ListEmptyComponent={
          privateChat ? (
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
          ) : null
        }
        ListHeaderComponent={
          <View>
            {showBroadcastOption ? (
              <ChatFilterItem
                item={ChatBroadcastFilter}
                active={isBroadcastFilterSelected}
                disabled={isBroadcastFilterSelected}
                icon={<ParticipantsIcon />}
                onDismiss={onDismiss}
              />
            ) : null}

            {showBroadcastOption && rolesSpecificChat.length > 0 ? (
              <BottomSheet.Divider style={styles.divider} />
            ) : null}

            {rolesSpecificChat.length > 0 ? (
              <View>
                <Text style={[styles.label, hmsRoomStyles.label]}>ROLES</Text>
                {rolesSpecificChat.map((role) => {
                  const isRoleSelected =
                    filter !== null && 'publishSettings' in filter;
                  const isActive =
                    filter !== null &&
                    isRoleSelected &&
                    filter.name === role.name;

                  return (
                    <ChatFilterItem
                      key={role.name}
                      item={role}
                      active={isActive}
                      disabled={isActive}
                      onDismiss={onDismiss}
                    />
                  );
                })}
              </View>
            ) : null}

            {rolesSpecificChat.length > 0 && privateChat ? (
              <BottomSheet.Divider style={styles.divider} />
            ) : null}

            {rolesSpecificChat.length <= 0 &&
            privateChat &&
            showBroadcastOption ? (
              <BottomSheet.Divider style={styles.divider} />
            ) : null}

            {privateChat ? (
              <Text style={[styles.label, hmsRoomStyles.label]}>
                PARTICIPANTS
              </Text>
            ) : null}
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
