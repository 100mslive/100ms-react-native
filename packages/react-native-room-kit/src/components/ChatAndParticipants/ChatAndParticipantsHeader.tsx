import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { CloseIcon, SettingsIcon } from '../../Icons';
import {
  useHMSCanDisableChat,
  useHMSRoomStyleSheet,
  useShowChatAndParticipants,
} from '../../hooks-util';
import type { RootState } from '../../redux';
import { ChatBottomSheetTabs } from '../../utils/types';
import {
  setActiveChatBottomSheetTab,
  setChatMoreActionsSheetVisible,
} from '../../redux/actions';
import { TestIds } from '../../utils/constants';

interface WebrtcChatHeaderProps {
  onClosePress?: () => void;
}

const _ChatAndParticipantsHeader: React.FC<WebrtcChatHeaderProps> = ({
  onClosePress,
}) => {
  const dispatch = useDispatch();
  const peersCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );
  const canDisableChat = useHMSCanDisableChat();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerTitleWrapper: {
      backgroundColor: theme.palette.surface_default,
    },
    tab: {
      backgroundColor: theme.palette.surface_bright,
    },
    headerTitle: {
      color: theme.palette.on_surface_low,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    activeHeaderTitle: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const activeChatBottomSheetTab = useSelector(
    (state: RootState) => state.app.activeChatBottomSheetTab
  );
  const { canShowParticipants, canShowChat, overlayChatLayout } =
    useShowChatAndParticipants();

  const visibleChatBottomSheetTabs = ChatBottomSheetTabs.filter((tab) => {
    if (tab === 'Participants') return canShowParticipants;
    if (tab === 'Chat') return canShowChat && !overlayChatLayout;
    return true;
  });

  const onSettingsPress = () => {
    dispatch(setChatMoreActionsSheetVisible(true));
  };

  const hideSettigsButton =
    !canDisableChat || // can't disable chat, OR
    (visibleChatBottomSheetTabs.length === 1 &&
      visibleChatBottomSheetTabs[0] === 'Participants'); // Only Participants Header is visible

  return (
    <View
      style={
        visibleChatBottomSheetTabs.length > 1
          ? styles.tabsHeader
          : styles.header
      }
    >
      {visibleChatBottomSheetTabs.length === 1 ? (
        <Text
          testID={
            visibleChatBottomSheetTabs[0] === 'Participants'
              ? TestIds.participants_heading
              : visibleChatBottomSheetTabs[0] === 'Chat'
                ? TestIds.chat_heading
                : undefined
          }
          style={[styles.headerTitle, hmsRoomStyles.activeHeaderTitle]}
        >
          {visibleChatBottomSheetTabs[0]}
          {visibleChatBottomSheetTabs[0] === 'Participants' &&
          typeof peersCount === 'number'
            ? ` (${peersCount})`
            : null}
        </Text>
      ) : (
        <View
          style={[styles.headerTitleWrapper, hmsRoomStyles.headerTitleWrapper]}
        >
          {visibleChatBottomSheetTabs.map((tab) => {
            const isActive = activeChatBottomSheetTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                testID={
                  tab === 'Participants'
                    ? TestIds.participants_heading_btn
                    : tab === 'Chat'
                      ? TestIds.chat_heading_btn
                      : undefined
                }
                style={[styles.tab, isActive ? hmsRoomStyles.tab : null]}
                onPress={() => dispatch(setActiveChatBottomSheetTab(tab))}
              >
                <Text
                  testID={
                    tab === 'Participants'
                      ? isActive
                        ? TestIds.participants_heading_active
                        : TestIds.participants_heading
                      : tab === 'Chat'
                        ? isActive
                          ? TestIds.chat_heading_active
                          : TestIds.chat_heading
                        : undefined
                  }
                  style={[
                    styles.headerTitle,
                    hmsRoomStyles.headerTitle,
                    isActive ? hmsRoomStyles.activeHeaderTitle : null,
                  ]}
                >
                  {tab}
                  {tab === 'Participants' && typeof peersCount === 'number'
                    ? ` (${peersCount})`
                    : null}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={{ flexDirection: 'row' }}>
        {hideSettigsButton ? null : (
          <TouchableOpacity
            disabled={activeChatBottomSheetTab === 'Participants'}
            onPress={onSettingsPress}
            style={{
              marginRight: 16,
              opacity: activeChatBottomSheetTab === 'Participants' ? 0.5 : 1,
            }}
          >
            <SettingsIcon />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          testID={TestIds.participants_close_btn}
          onPress={onClosePress}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  headerTitleWrapper: {
    flex: 1,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    marginRight: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
});

export const ChatAndParticipantsHeader = React.memo(_ChatAndParticipantsHeader);
