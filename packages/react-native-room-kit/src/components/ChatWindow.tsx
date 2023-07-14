import React, { useState, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  TextInput,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  HMSMessage,
  HMSMessageRecipient,
  HMSMessageRecipientType,
  HMSMessageType,
  HMSPeer,
  HMSRemotePeer,
  HMSRole,
} from '@100mslive/react-native-hms';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { Menu, MenuDivider, MenuItem } from './MenuModal';
import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import { addMessage } from '../redux/actions';
import { PressableIcon } from './PressableIcon';
import { ChatIcon, CloseIcon, ParticipantsIcon, SendIcon } from '../Icons';
import { useHMSInstance, useShowChat } from '../hooks-util';
import { ChatList } from './Chat';
import { SearchableParticipantsView } from './Participants';

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
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
});

interface ChatAndParticipantsHeaderProps {
  activeTab: string;
  setActiveTab(tab: string): void;
  onClosePress?: () => void;
}

const tabs = ['Chat', 'Participants'];

export const ChatAndParticipantsHeader: React.FC<
  ChatAndParticipantsHeaderProps
> = ({ activeTab, setActiveTab, onClosePress }) => {
  return (
    <View style={chatAndParticipantsHeaderStyles.container}>
      <View style={chatAndParticipantsHeaderStyles.grayBar} />

      <View style={chatAndParticipantsHeaderStyles.header}>
        <View style={chatAndParticipantsHeaderStyles.headerTitleWrapper}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            const TabIcon = tab === 'Chat' ? ChatIcon : ParticipantsIcon;

            return (
              <TouchableOpacity
                key={tab}
                style={[
                  chatAndParticipantsHeaderStyles.tab,
                  isActive ? { borderColor: COLORS.PRIMARY.DEFAULT } : null,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <TabIcon
                  style={[
                    chatAndParticipantsHeaderStyles.tabIcon,
                    isActive ? { tintColor: COLORS.PRIMARY.DEFAULT } : null,
                  ]}
                />

                <Text
                  style={[
                    chatHeaderStyles.headerTitle,
                    isActive ? null : { color: COLORS.SURFACE.ON_SURFACE.LOW },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <PressableIcon border={false} onPress={onClosePress}>
          <CloseIcon style={chatHeaderStyles.closeIcon} />
        </PressableIcon>
      </View>
    </View>
  );
};

const chatAndParticipantsHeaderStyles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  grayBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: COLORS.BORDER.LIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 2,
    marginRight: 16,
    borderColor: COLORS.BORDER.LIGHT,
  },
  tabIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: COLORS.SURFACE.ON_SURFACE.LOW,
  },
});

interface ChatTextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  clearButton?: boolean;
}

export const ChatTextInput: React.FC<ChatTextInputProps> = ({
  containerStyle,
  clearButton = false,
}) => {
  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();
  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer
  );
  const [inputFocused, setInputFocused] = React.useState(false);
  const typedMessage = useSelector(
    (state: RootState) => state.chatWindow.typedMessage
  );
  const sendingTo = useSelector(
    (state: RootState) =>
      state.chatWindow.sendTo as HMSRole | HMSRemotePeer | { name: string }
  );
  const sendingToType = useSelector(
    (state: RootState) => state.chatWindow.sendToType
  );

  const handleInputFocus = () => setInputFocused(true);

  const handleInputBlur = () => setInputFocused(false);

  const handleMessageTyping = (text: string) => {
    dispatch({ type: 'SET_TYPED_MESSAGE', typedMessage: text });
  };

  const clearTypedMessage = () => {
    dispatch({ type: 'SET_TYPED_MESSAGE', typedMessage: '' });
  };

  const sendMessage = () => {
    if (typedMessage.length > 0 && hmsInstance) {
      let hmsMessageRecipient: HMSMessageRecipient;

      if (sendingToType === 'role') {
        hmsMessageRecipient = new HMSMessageRecipient({
          recipientType: HMSMessageRecipientType.ROLES,
          recipientRoles: [sendingTo as HMSRole],
        });
      } else if (sendingToType === 'direct') {
        hmsMessageRecipient = new HMSMessageRecipient({
          recipientType: HMSMessageRecipientType.PEER,
          recipientPeer: sendingTo as HMSPeer,
        });
      } else {
        hmsMessageRecipient = new HMSMessageRecipient({
          recipientType: HMSMessageRecipientType.BROADCAST,
        });
      }

      // Saving reference of `typedMessage` state to local variable
      // to use the typed message after clearing state
      const messageText = typedMessage;

      clearTypedMessage();

      const handleMessageID = ({
        messageId,
      }: {
        messageId: string | undefined;
      }) => {
        if (messageId) {
          const localMessage = new HMSMessage({
            messageId: messageId,
            message: messageText,
            type: HMSMessageType.CHAT,
            time: new Date(),
            sender: localPeer || undefined,
            recipient: hmsMessageRecipient,
          });
          dispatch(addMessage(localMessage));
        }
      };

      if (sendingToType === 'role') {
        hmsInstance
          .sendGroupMessage(messageText, [sendingTo as HMSRole])
          .then(handleMessageID);
      } else if (sendingToType === 'direct') {
        hmsInstance
          .sendDirectMessage(messageText, sendingTo as HMSPeer)
          .then(handleMessageID);
      } else {
        hmsInstance.sendBroadcastMessage(messageText).then(handleMessageID);
      }
    }
  };

  return (
    <View
      style={[
        chatTextInputStyles.inputContainer,
        {
          borderColor: inputFocused
            ? COLORS.PRIMARY.DEFAULT
            : COLORS.SURFACE.DEFAULT,
        },
        containerStyle,
      ]}
    >
      <TextInput
        style={chatTextInputStyles.input}
        value={typedMessage}
        onChangeText={handleMessageTyping}
        placeholder={`Send a message to ${sendingTo.name}`}
        autoCapitalize="sentences"
        autoCompleteType="off"
        placeholderTextColor={COLORS.SURFACE.ON_SURFACE.LOW}
        selectionColor={COLORS.SURFACE.ON_SURFACE.HIGH}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        blurOnSubmit={true}
        onSubmitEditing={sendMessage}
        returnKeyType="send"
      />
      {clearButton && typedMessage.length > 0 ? (
        <PressableIcon
          onPress={clearTypedMessage}
          border={false}
          rounded={false}
          style={chatTextInputStyles.sendIconWrapper}
        >
          <CloseIcon style={chatTextInputStyles.sendIcon} />
        </PressableIcon>
      ) : null}
      <PressableIcon
        onPress={sendMessage}
        border={false}
        rounded={false}
        style={chatTextInputStyles.sendIconWrapper}
      >
        <SendIcon style={chatTextInputStyles.sendIcon} />
      </PressableIcon>
    </View>
  );
};

const chatTextInputStyles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: COLORS.SURFACE.DEFAULT,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.SURFACE.DEFAULT,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    textAlignVertical: 'center',
    paddingHorizontal: 16,
    paddingRight: 0,
    paddingVertical: 12,
    color: COLORS.SURFACE.ON_SURFACE.HIGH,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  sendIconWrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    tintColor: COLORS.SURFACE.ON_SURFACE.LOW,
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

  // const estimatedListSize = useMemo(() => ({
  //   height: Dimensions.get('window').height * 0.45,
  //   width: Dimensions.get('window').width - 32,
  // }), []);

  return (
    // <Animated.View
    //   style={chatViewStyles.container}
    //   entering={SlideInDown}
    //   exiting={SlideOutDown}
    // >
    <View style={chatViewStyles.container}>
      <ChatAndParticipantsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClosePress={hideInsetChatView}
      />

      {activeTab === 'Chat' ? (
        <>
          <ChatList />

          <ChatTextInput clearButton={true} />
        </>
      ) : activeTab === 'Participants' ? (
        <View style={chatViewStyles.participantsWrapper}>
          <SearchableParticipantsView />
        </View>
      ) : null}
    </View>
    // </Animated.View>
  );
};

const chatViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SURFACE.DIM,
    padding: 16,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  participantsWrapper: {
    marginTop: 16,
  },
});

export const ChatWindow: React.FC = () => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ChatHeader filters={true} />

      <ChatList />

      <View
        style={bottom === 0 ? styles.inputContainer : { marginBottom: bottom }}
      >
        <ChatTextInput clearButton={true} containerStyle={styles.input} />
      </View>
    </View>
  );
};

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
