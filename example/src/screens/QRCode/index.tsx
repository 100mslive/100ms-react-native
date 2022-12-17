import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {AppStackParamList} from '../../navigator';
import {styles} from './styles';
import {getMeetingUrl, validateUrl} from '../../utils/functions';
import {COLORS} from '../../utils/theme';
import {
  CustomButton,
  CustomInput,
  DefaultModal,
  JoinSettingsModalContent,
} from '../../components';
import {saveUserData} from '../../redux/actions';
import {Constants} from '../../utils/types';

type QRCodeScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'QRCodeScreen'
>;

const QRCode = () => {
  const navigate = useNavigation<QRCodeScreenProp>().navigate;
  const {top, bottom, left, right} = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [joinDisabled, setJoinDisabled] = useState<boolean>(true);
  const [joiningLink, setJoiningLink] = useState<string>(getMeetingUrl());
  const [moreModalVisible, setMoreModalVisible] = useState(false);

  const onJoinPress = () => {
    if (joiningLink.includes('app.100ms.live/')) {
      dispatch(
        saveUserData({
          roomID: joiningLink.replace('meeting', 'preview'),
          isHLSFlow: true,
        }),
      );
      navigate('WelcomeScreen');
    } else {
      Alert.alert('Error', 'Invalid URL');
    }
  };

  const handleMorePress = () => setMoreModalVisible(true);

  const closeMoreModal = () => setMoreModalVisible(false);

  const onScanQRCodePress = () => {
    navigate('QRCodeScannerScreen');
  };

  useEffect(() => {
    setJoinDisabled(!validateUrl(joiningLink));
  }, [joiningLink]);

  useEffect(() => {
    Linking.getInitialURL().then(url => {
      if (url) {
        setJoiningLink(url);
      }
    });

    const updateUrl = ({url}: {url: string}) => {
      if (url) {
        setJoiningLink(url);
      }
    };
    Linking.addEventListener('url', updateUrl);

    return () => {
      Linking.removeEventListener('url', updateUrl);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(Constants.MEET_URL, (_error, url) => {
        if (url) {
          setJoiningLink(url);
        }
      });
    }, []),
  );

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
        <Image
          style={styles.image}
          resizeMode="stretch"
          source={require('../../../assets/illustration.png')}
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
          value={joiningLink}
          onChangeText={setJoiningLink}
          inputStyle={styles.joiningLinkInput}
          placeholderTextColor={COLORS.TEXT.DISABLED}
          placeholder="Paste the link here"
          multiline
          blurOnSubmit
        />
        <View style={{flexDirection: 'row'}}>
          <CustomButton
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
            onPress={handleMorePress}
            viewStyle={styles.moreButton}
            RightIcon={
              <MaterialIcons
                name="more-vert"
                style={styles.moreButtonIcon}
                size={24}
              />
            }
          />
        </View>
        <View style={styles.horizontalSeparator} />
        <CustomButton
          title="Scan QR Code"
          onPress={onScanQRCodePress}
          viewStyle={styles.scanQRButton}
          textStyle={styles.joinButtonText}
          LeftIcon={
            <MaterialCommunityIcons
              name="qrcode"
              style={styles.scanQRButtonIcon}
              size={24}
            />
          }
        />
      </ScrollView>

      <DefaultModal
        modalVisible={moreModalVisible}
        viewStyle={{height: 700}}
        setModalVisible={closeMoreModal}
      >
        <JoinSettingsModalContent />
      </DefaultModal>
    </KeyboardAvoidingView>
  );
};

export {QRCode};
