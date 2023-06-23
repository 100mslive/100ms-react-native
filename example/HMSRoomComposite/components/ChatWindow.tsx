import React, {useState, useEffect, memo} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import {
  HMSLocalPeer,
  HMSMessage,
  HMSMessageRecipient,
  HMSMessageRecipientType,
  HMSMessageType,
  HMSPeer,
  HMSRemotePeer,
  HMSRole,
  HMSSDK,
} from '@100mslive/react-native-hms';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {Menu, MenuDivider, MenuItem} from './MenuModal';
import {COLORS} from '../utils/theme';
import type {RootState} from '../redux';
import {CustomInput} from './CustomInput';
import {CustomButton} from './CustomButton';
import {addMessage, addPinnedMessage} from '../redux/actions';

const getTimeStringin12HourFormat = (time: Date) => {
  let hours = time.getHours();
  const minutes = time.getMinutes();
  const notation = hours / 12 > 1 ? ' PM' : ' AM';
  hours = hours % 12;
  return (
    (hours < 10 ? '0' + hours : hours) +
    ':' +
    (minutes < 10 ? '0' + minutes : minutes) +
    notation
  );
};

const ChatFilter = memo(
  ({
    instance,
    filter,
    setFilter,
    setType,
    setReceiverObject,
  }: {
    instance?: HMSSDK;
    filter?: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    setType: React.Dispatch<
      React.SetStateAction<'everyone' | 'direct' | 'role'>
    >;
    setReceiverObject: React.Dispatch<
      React.SetStateAction<'everyone' | HMSRole | HMSRemotePeer>
    >;
  }) => {
    const roles = useSelector((state: RootState) => state.user.roles);

    const [visible, setVisible] = useState<boolean>(false);
    const [remotePeers, setRemotePeers] = useState<HMSRemotePeer[]>();

    const hideMenu = () => setVisible(false);
    const showMenu = () => setVisible(true);

    useEffect(() => {
      instance?.getRemotePeers().then(currentRemotePeers => {
        setRemotePeers(currentRemotePeers);
      });
    }, [instance]);

    return (
      <Menu
        visible={visible}
        anchor={
          <TouchableOpacity
            style={styles.chatFilterContainer}
            onPress={showMenu}
          >
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
            setType('everyone');
            setReceiverObject('everyone');
            setFilter('everyone');
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
        {roles?.map(knownRole => {
          return (
            <MenuItem
              onPress={() => {
                hideMenu();
                setType('role');
                setReceiverObject(knownRole);
                setFilter(knownRole?.name!);
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
        {remotePeers?.map(remotePeer => {
          return (
            <MenuItem
              onPress={() => {
                hideMenu();
                setType('direct');
                setReceiverObject(remotePeer);
                setFilter(remotePeer.name);
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
  },
);

ChatFilter.displayName = 'ChatFilter';

const ChatList = ({
  setSessionMetaData,
}: {
  setSessionMetaData: (value: string | null) => void;
}) => {
  const messages = useSelector((state: RootState) => state.messages.messages);

  // const scollviewRef = useRef<FlatList>(null);

  // useEffect(() => {
  //   scollviewRef?.current?.scrollToEnd({animated: false});
  // }, []);

  // useEffect(() => {
  //   scollviewRef?.current?.scrollToEnd({animated: true});
  // }, [messages]);

  return (
    <FlatList
      data={messages}
      initialNumToRender={2}
      maxToRenderPerBatch={3}
      windowSize={11}
      keyboardShouldPersistTaps="always"
      renderItem={({item, index}: {item: HMSMessage; index: number}) => {
        const data = item;
        const isLocal = data.sender?.isLocal;
        return (
          <View
            style={[
              styles.messageBubble,
              (data.recipient.recipientType === HMSMessageRecipientType.PEER ||
                data.recipient.recipientType ===
                  HMSMessageRecipientType.ROLES) &&
                styles.privateMessageBubble,
              isLocal && styles.sendMessageBubble,
            ]}
            key={index}
          >
            <View style={styles.headingContainer}>
              <View style={styles.headingLeftContainer}>
                <Text style={styles.senderName}>
                  {data.sender
                    ? data.sender?.isLocal
                      ? 'You'
                      : data.sender?.name
                    : 'Anonymous'}
                </Text>
                <Text style={styles.messageTime}>
                  {getTimeStringin12HourFormat(data.time)}
                </Text>
              </View>
              {(data.recipient.recipientType === HMSMessageRecipientType.PEER ||
                data.recipient.recipientType ===
                  HMSMessageRecipientType.ROLES) && (
                <View style={styles.headingRightContainer}>
                  <Text style={styles.private}>
                    {data.recipient.recipientType ===
                      HMSMessageRecipientType.PEER &&
                      `${
                        isLocal
                          ? 'TO ' + data.recipient.recipientPeer?.name + ' | '
                          : 'TO YOU | '
                      }PRIVATE`}
                    {data.recipient.recipientType ===
                      HMSMessageRecipientType.ROLES &&
                      data?.recipient?.recipientRoles &&
                      data.recipient.recipientRoles[0].name}
                  </Text>
                </View>
              )}
              {data.recipient.recipientType ===
                HMSMessageRecipientType.BROADCAST && (
                <CustomButton
                  onPress={() =>
                    setSessionMetaData(
                      `${data.sender ? data.sender?.name : 'Anonymous'}: ${
                        data.message
                      }`,
                    )
                  }
                  viewStyle={styles.pinIconContainer}
                  LeftIcon={
                    <MaterialCommunityIcons
                      style={styles.pinIcon}
                      size={24}
                      name="pin-outline"
                    />
                  }
                />
              )}
            </View>
            <Text
              style={[styles.messageText, {color: COLORS.TEXT.DISABLED}]}
              ellipsizeMode="middle"
            >
              {data.messageId}
            </Text>
            <Text style={styles.messageText}>{data.message}</Text>
          </View>
        );
      }}
      keyExtractor={(item, index) => item.message + index}
    />
  );
};

export const ChatWindow: React.FC = () => {
  // hooks
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const localPeer = useSelector(
    (state: RootState) => state.hmsStates.localPeer,
  );
  const hmsSessionStore = useSelector(
    (state: RootState) => state.user.hmsSessionStore,
  );
  const pinnedMessage = useSelector(
    (state: RootState) => state.messages.pinnedMessage,
  );
  const dispatch = useDispatch();
  const {bottom} = useSafeAreaInsets();

  // useState hook
  const [filter, setFilter] = useState<string>('everyone');
  const [type, setType] = useState<'everyone' | 'role' | 'direct'>('everyone');
  const [receiverObject, setReceiverObject] = useState<
    'everyone' | HMSRole | HMSRemotePeer
  >('everyone');
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [text, setText] = useState('');

  const setSessionMetaData = async (value: string | null) => {
    // If instance of HMSSessionStore is available
    if (hmsSessionStore) {
      try {
        // set `value` on `session` with key 'pinnedMessage'
        const response = await hmsSessionStore.set(value, 'pinnedMessage');
        console.log('setSessionMetaData Response -> ', response);
      } catch (error) {
        console.log('setSessionMetaData Error -> ', error);
      }
    }
  };

  const sendMessage = () => {
    if (text.length > 0 && hmsInstance) {
      let hmsMessageRecipient: HMSMessageRecipient;

      if (type === 'role') {
        hmsMessageRecipient = new HMSMessageRecipient({
          recipientType: HMSMessageRecipientType.ROLES,
          recipientRoles: [receiverObject as HMSRole],
        });
      } else if (type === 'direct') {
        hmsMessageRecipient = new HMSMessageRecipient({
          recipientType: HMSMessageRecipientType.PEER,
          recipientPeer: receiverObject as HMSPeer,
        });
      } else {
        hmsMessageRecipient = new HMSMessageRecipient({
          recipientType: HMSMessageRecipientType.BROADCAST,
        });
      }

      // Saving reference of `text` state to local variable
      // to use the typed message after clearing state
      const messageText = text;

      setText('');

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

      if (type === 'role') {
        hmsInstance
          .sendGroupMessage(messageText, [receiverObject as HMSRole])
          .then(handleMessageID);
      } else if (type === 'direct') {
        hmsInstance
          .sendDirectMessage(messageText, receiverObject as HMSPeer)
          .then(handleMessageID);
      } else {
        hmsInstance.sendBroadcastMessage(messageText).then(handleMessageID);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chatHeaderContainer}>
        <Text style={styles.chatHeading}>Chat</Text>
        <ChatFilter
          instance={hmsInstance}
          filter={filter}
          setFilter={setFilter}
          setType={setType}
          setReceiverObject={setReceiverObject}
        />
      </View>
      <View style={styles.contentContainer}>
        {showBanner && (
          <View style={styles.banner}>
            <View style={styles.bannerIconContainer}>
              <Feather style={styles.bannerIcon} size={16} name="info" />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerText}>
                Messages can only be seen by people in the call and are deleted
                when the call ends.
              </Text>
            </View>
            <CustomButton
              onPress={() => setShowBanner(false)}
              viewStyle={styles.bannerIconContainer}
              LeftIcon={
                <MaterialCommunityIcons
                  style={styles.bannerIcon}
                  size={24}
                  name="close"
                />
              }
            />
          </View>
        )}
        {pinnedMessage && pinnedMessage.length > 0 ? (
          <View style={styles.banner}>
            <View style={styles.bannerIconContainer}>
              <MaterialCommunityIcons
                style={styles.bannerIcon}
                size={16}
                name="pin-outline"
              />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerText}>{pinnedMessage}</Text>
            </View>
            <CustomButton
              onPress={() => setSessionMetaData(null)}
              viewStyle={styles.bannerIconContainer}
              LeftIcon={
                <MaterialCommunityIcons
                  style={styles.bannerIcon}
                  size={24}
                  name="close"
                />
              }
            />
          </View>
        ) : null}
        <ChatList setSessionMetaData={setSessionMetaData} />
      </View>
      <View
        style={bottom === 0 ? styles.inputContainer : {marginBottom: bottom}}
      >
        <CustomInput
          value={text}
          onChangeText={setText}
          inputStyle={styles.chatInput}
          clearButtonStyle={styles.clearButtonStyle}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder={`Send a message to ${
            receiverObject === 'everyone' ? receiverObject : receiverObject.name
          }`}
        />
        <CustomButton
          onPress={sendMessage}
          viewStyle={styles.sendMessageButton}
          LeftIcon={
            <MaterialCommunityIcons
              style={styles.sendMessageIcon}
              size={24}
              name="send"
            />
          }
        />
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
  banner: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderRadius: 8,
  },
  bannerIcon: {
    color: COLORS.TEXT.DISABLED,
  },
  bannerIconContainer: {
    width: 52,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
  },
  contentContainer: {
    flex: 1,
    marginVertical: 4,
  },
  messageBubble: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    width: '90%',
  },
  privateMessageBubble: {
    backgroundColor: COLORS.SURFACE.LIGHT,
  },
  sendMessageBubble: {
    alignSelf: 'flex-end',
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
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    textTransform: 'capitalize',
    marginRight: 8,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    flexWrap: 'wrap',
  },
  inputContainer: {
    marginBottom: 16,
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
