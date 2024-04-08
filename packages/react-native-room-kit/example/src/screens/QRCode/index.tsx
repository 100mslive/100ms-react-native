import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';

import type { AppStackParamList } from '../../navigator';
import { styles } from './styles';
import {
  getMeetingUrl,
  validateJoiningLink,
  validateUrl,
} from '../../utils/functions';
import { COLORS } from '../../utils/theme';
import {
  CustomButton,
  CustomInput,
  DefaultModal,
  JoinSettingsModalContent,
} from '../../components';
import { Constants } from '../../utils/types';
import { RootState } from '../../redux';
import { callService } from '../../utils/functions';
import LottieSplashScreen from 'react-native-lottie-splash-screen';
import { QRCodeIcon, ThreeDotsIcon } from '../../icons';

type QRCodeScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'QRCodeScreen'
>;

const QRCode = () => {
  const navigate = useNavigation<QRCodeScreenProp>().navigate;
  const { top, bottom, left, right } = useSafeAreaInsets();
  const debugMode = useSelector(
    (state: RootState) => state.app.joinConfig.debugMode
  );
  const staticUserId = useSelector(
    (state: RootState) => state.app.joinConfig.staticUserId
  );

  const [joiningLink, setJoiningLink] = useState(getMeetingUrl());
  const [username, setUsername] = useState('');
  const [moreModalVisible, setMoreModalVisible] = useState(false);

  const onJoinPress = async () => {
    Keyboard.dismiss();
    if (joiningLink.includes('app.100ms.live/')) {
      await callService(
        joiningLink,
        (
          roomCode: string,
          userId: string,
          tokenEndpoint: string | undefined,
          initEndpoint: string | undefined,
          layoutEndPoint: string | undefined
        ) => {
          // Saving Meeting Link to Async Storage for persisting it between app starts.
          AsyncStorage.setItem(
            Constants.MEET_URL,
            joiningLink.replace('preview', 'meeting')
          );

          AsyncStorage.setItem(Constants.NAME, username);

          navigate('HMSPrebuiltScreen', {
            roomCode,
            userId: staticUserId ? Constants.STATIC_USERID : userId,
            userName: username,
            initEndPoint: initEndpoint,
            tokenEndPoint: tokenEndpoint,
            layoutEndPoint: layoutEndPoint,
            debugMode, // default is false, will deal with this later
          });
        },
        (errorMsg: string) => {
          Toast.showWithGravity(errorMsg, Toast.LONG, Toast.TOP);
        }
      );
    } else {
      Alert.alert('Error', 'Invalid URL');
    }
  };

  const handleMorePress = () => setMoreModalVisible(true);

  const closeMoreModal = () => setMoreModalVisible(false);

  const onScanQRCodePress = () => navigate('QRCodeScannerScreen');

  // Handle Splash screen
  useEffect(() => {
    setTimeout(() => {
      LottieSplashScreen.hide();
    }, 1000);
  }, []);

  // Handle Deep Linking
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url && validateJoiningLink(url)) {
        setJoiningLink(url);
      }
    });

    const updateUrl = ({ url }: { url: string }) => {
      if (url && validateJoiningLink(url)) {
        setJoiningLink(url);
      }
    };
    Linking.addEventListener('url', updateUrl);

    return () => {
      Linking.removeEventListener('url', updateUrl);
    };
  }, []);

  // Get saved room link from Async Storage
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(Constants.MEET_URL, (_error, url) => {
        if (url && validateJoiningLink(url)) {
          setJoiningLink(url);
        }
      });
      AsyncStorage.getItem(Constants.NAME, (_error, name) => {
        if (name) {
          setUsername(name);
        }
      });
    }, [])
  );

  const joinDisabled = !validateUrl(joiningLink);

  return (
    <KeyboardAvoidingView
      enabled={Platform.OS === 'ios'}
      behavior="padding"
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contentContainerStyle,
          {
            paddingTop: 24 + top,
            paddingLeft: 24 + left,
            paddingRight: 24 + right,
            paddingBottom: 24 + bottom,
          },
        ]}
        style={styles.container}
        keyboardShouldPersistTaps="always"
      >
        {/* ts-ignore: ignore-next */}
        <View
          style={{
            backgroundColor: 'black',
            top: 20,
            right: 20,
            position: 'absolute',
          }}
        ></View>

        <Image
          style={styles.image}
          resizeMode="stretch"
          source={require('../../assets/illustration.png')}
        />
        <View>
          <Text style={styles.heading}>Experience the power of 100ms</Text>
          <Text style={styles.description}>
            Jump right in by pasting a room link or scanning a QR code
          </Text>
        </View>

        <View style={styles.joiningLinkInputView}>
          <Text style={styles.joiningLinkInputText}>Joining Link</Text>
        </View>

        <CustomInput
          inputTestID="enter-room-link-input"
          clearTestID="clear-room-link-button"
          value={joiningLink}
          onChangeText={setJoiningLink}
          inputStyle={styles.joiningLinkInput}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder="Paste the link here"
          multiline
          blurOnSubmit
        />

        <View style={styles.usernameInputView}>
          <Text style={styles.joiningLinkInputText}>User Name</Text>
        </View>

        <CustomInput
          inputTestID="enter-username-input"
          clearTestID="clear-username-button"
          value={username}
          onChangeText={setUsername}
          inputStyle={styles.joiningLinkInput}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder="Enter username"
          multiline
          blurOnSubmit
        />

        <View style={{ flexDirection: 'row' }}>
          <CustomButton
            testID="join-now-button"
            title="Join Now"
            onPress={onJoinPress}
            disabled={joinDisabled}
            viewStyle={[styles.joinButton, joinDisabled && styles.disabled]}
            textStyle={[
              styles.joinButtonText,
              joinDisabled && styles.disabledText,
            ]}
          />
          <CustomButton
            testID="three-dots-config-button"
            onPress={handleMorePress}
            viewStyle={styles.moreButton}
            RightIcon={<ThreeDotsIcon style={styles.moreButtonIcon} />}
          />
        </View>

        <View style={styles.horizontalSeparator} />

        <CustomButton
          title="Scan QR Code"
          onPress={onScanQRCodePress}
          viewStyle={styles.scanQRButton}
          textStyle={styles.joinButtonText}
          LeftIcon={<QRCodeIcon style={styles.scanQRButtonIcon} />}
        />
      </ScrollView>

      <DefaultModal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        modalVisible={moreModalVisible}
        viewStyle={{ height: 700 }}
        setModalVisible={closeMoreModal}
      >
        <JoinSettingsModalContent />
      </DefaultModal>
    </KeyboardAvoidingView>
  );
};

export { QRCode };
