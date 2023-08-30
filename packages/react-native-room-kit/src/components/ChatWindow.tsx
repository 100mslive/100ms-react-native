import React, { useState, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { HMSRemotePeer } from '@100mslive/react-native-hms';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import { Menu, MenuDivider, MenuItem } from './MenuModal';
import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import { PressableIcon } from './PressableIcon';
import { CloseIcon } from '../Icons';
import {
  useHMSInstance,
  useHMSRoomStyleSheet,
  useShowChat,
} from '../hooks-util';
import { ChatList } from './Chat';
import { SearchableParticipantsView } from './Participants';
import { HMSSendMessageInput } from './HMSSendMessageInput';

interface ChatHeaderProps {
  filters: boolean;
  onClosePress?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  filters,
  onClosePress,
}) => {
  return (
    <View style={chatHeaderStyles.header}>
      <View style={chatHeaderStyles.headerTitleWrapper}>
        <Text style={chatHeaderStyles.headerTitle}>Chat</Text>

        {filters ? <ChatFilter /> : null}
      </View>

      <PressableIcon border={false} onPress={onClosePress}>
        <CloseIcon />
      </PressableIcon>
    </View>
  );
};

const chatHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
});

interface ChatAndParticipantsHeaderProps {
  activeTab: string;
  setActiveTab(tab: string): void;
  onClosePress?: () => void;
}

const tabs: [string, string] = ['Chat', 'Participants'];

export const ChatAndParticipantsHeader: React.FC<
  ChatAndParticipantsHeaderProps
> = ({ activeTab, setActiveTab, onClosePress }) => {
  const peersCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    tab: {
      backgroundColor: theme.palette.surface_bright,
    },
    headerTitle: {
      color: theme.palette.on_surface_low,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    activeHeaderTitle: {
      color: theme.palette.on_surface_high,
    },
  }));

  return (
    <View style={chatAndParticipantsHeaderStyles.header}>
      <View style={chatAndParticipantsHeaderStyles.headerTitleWrapper}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={[
                chatAndParticipantsHeaderStyles.tab,
                isActive ? hmsRoomStyles.tab : null,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  chatHeaderStyles.headerTitle,
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

      <TouchableOpacity onPress={onClosePress}>
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );
};

const chatAndParticipantsHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleWrapper: {
    flex: 1,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    backgroundColor: COLORS.SURFACE.DEFAULT,
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
});

const ChatFilter = memo(() => {
  const instance = useHMSInstance();
  const dispatch = useDispatch();
  const roles = useSelector((state: RootState) => state.hmsStates.roles);
  const filter = useSelector(
    (state: RootState) => state.chatWindow.sendTo.name as string | undefined
  );

  const [visible, setVisible] = useState<boolean>(false);
  const [remotePeers, setRemotePeers] = useState<HMSRemotePeer[]>();

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  useEffect(() => {
    instance?.getRemotePeers().then((currentRemotePeers) => {
      setRemotePeers(currentRemotePeers);
    });
  }, [instance]);

  return (
    <Menu
      visible={visible}
      anchor={
        <TouchableOpacity style={styles.chatFilterContainer} onPress={showMenu}>
          <Text style={styles.chatFilterText} numberOfLines={1}>
            {filter}
          </Text>
          <MaterialIcons
            name={visible ? 'arrow-drop-up' : 'arrow-drop-down'}
            style={styles.chatFilterIcon}
            size={24}
          />
        </TouchableOpacity>
      }
      onRequestClose={hideMenu}
      style={styles.chatMenuContainer}
    >
      <MenuItem
        onPress={() => {
          hideMenu();
          dispatch({
            type: 'SET_SENDTO',
            sendTo: { name: 'everyone' },
            sendToType: 'everyone',
          });
        }}
      >
        <View style={styles.chatMenuItem}>
          <Ionicons
            name="people-outline"
            style={styles.chatMenuItemIcon}
            size={20}
          />
          <Text style={styles.chatMenuItemName}>Everyone</Text>
        </View>
      </MenuItem>
      <MenuDivider color={COLORS.BORDER.LIGHT} />
      {roles?.map((knownRole) => {
        return (
          <MenuItem
            onPress={() => {
              hideMenu();
              dispatch({
                type: 'SET_SENDTO',
                sendTo: knownRole,
                sendToType: 'role',
              });
            }}
            key={knownRole.name}
          >
            <View style={styles.chatMenuItem}>
              <Text style={styles.chatMenuItemName}>{knownRole?.name}</Text>
            </View>
          </MenuItem>
        );
      })}
      <MenuDivider color={COLORS.BORDER.LIGHT} />
      {remotePeers?.map((remotePeer) => {
        return (
          <MenuItem
            onPress={() => {
              hideMenu();
              dispatch({
                type: 'SET_SENDTO',
                sendTo: remotePeer,
                sendToType: 'direct',
              });
            }}
            key={remotePeer.name}
          >
            <View style={styles.chatMenuItem}>
              <Ionicons
                name="person-outline"
                style={styles.chatMenuItemIcon}
                size={20}
              />
              <Text style={styles.chatMenuItemName}>{remotePeer.name}</Text>
            </View>
          </MenuItem>
        );
      })}
    </Menu>
  );
});

ChatFilter.displayName = 'ChatFilter';

export const ChatView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [_, setChatVisible] = useShowChat();

  const hideInsetChatView = () => setChatVisible(false);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme) => ({
    container: {
      backgroundColor: theme.palette.surface_dim,
    },
    input: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.surface_default,
    },
  }));

  // const estimatedListSize = useMemo(() => ({
  //   height: Dimensions.get('window').height * 0.45,
  //   width: Dimensions.get('window').width - 32,
  // }), []);

  return (
    <View style={[chatViewStyles.container, hmsRoomStyles.container]}>
      <ChatAndParticipantsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClosePress={hideInsetChatView}
      />

      {activeTab === 'Chat' ? (
        <>
          <ChatList />

          <HMSSendMessageInput
            containerStyle={[chatViewStyles.input, hmsRoomStyles.input]}
          />
        </>
      ) : activeTab === 'Participants' ? (
        <View style={chatViewStyles.participantsWrapper}>
          <SearchableParticipantsView />
        </View>
      ) : null}
    </View>
  );
};

const chatViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    marginTop: 112,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  participantsWrapper: {
    marginTop: 16,
  },
  input: {
    flex: 0,
    height: 40,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
});

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.SURFACE.DEFAULT,
  },
  chatHeaderContainer: {
    height: 48,
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeading: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    paddingRight: 12,
  },
  chatFilterContainer: {
    marginLeft: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    borderWidth: 1,
    borderColor: COLORS.BORDER.LIGHT,
    borderRadius: 8,
  },
  chatFilterText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginRight: 12,
    textTransform: 'capitalize',
  },
  chatFilterIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    position: 'absolute',
    right: 0,
  },
  chatMenuContainer: {
    backgroundColor: COLORS.SURFACE.LIGHT,
  },
  chatMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Platform.OS === 'ios' ? 16 : 0,
  },
  chatMenuItemIcon: {
    color: COLORS.WHITE,
    paddingRight: 16,
    height: 24,
  },
  chatMenuItemName: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  chatInput: {
    backgroundColor: COLORS.SURFACE.LIGHT,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Medium',
    borderColor: COLORS.BORDER.LIGHT,
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 16,
    paddingRight: 88,
  },
  sendMessageButton: {
    position: 'absolute',
    alignItems: 'center',
    right: 0,
    paddingHorizontal: 12,
    width: 48,
  },
  sendMessageIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  clearButtonStyle: {
    right: 48,
    width: 40,
  },
  contentContainer: {
    flex: 1,
    marginVertical: 4,
  },
  messageBubble: {
    padding: 8,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
  },
  privateMessageBubble: {
    backgroundColor: COLORS.SURFACE.LIGHT,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  headingLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: COLORS.BORDER.LIGHT,
    justifyContent: 'center',
    padding: 4,
  },
  private: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    textTransform: 'uppercase',
  },
  senderName: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    textTransform: 'capitalize',
    marginHorizontal: 8,
  },
  messageTime: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: COLORS.SURFACE.ON_SURFACE.LOW,
  },
  messageText: {
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER.LIGHT,
  },
  pinIcon: {
    color: COLORS.WHITE,
  },
  pinIconContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
});
