import React, {useEffect, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {AppStackParamList} from '../../navigator';
import {styles} from './styles';
import {getMeetingUrl, validateUrl} from '../../utils/functions';
import {COLORS} from '../../utils/theme';
import {CustomButton, CustomInput} from '../../components';
import {saveUserData} from '../../redux/actions';
import type {RootState} from '../../redux';
import {Constants} from '../../utils/types';

type QRCodeScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'QRCodeScreen'
>;

const QRCode = () => {
  const navigate = useNavigation<QRCodeScreenProp>().navigate;
  const {isHLSFlow} = useSelector((state: RootState) => state.user);
  const {top, bottom, left, right} = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [joinDisabled, setJoinDisabled] = useState<boolean>(true);
  const [joiningLink, setJoiningLink] = useState<string>(getMeetingUrl());
  const [isHLSFlowEnabled, setIsHLSFlowEnabled] = useState<boolean>(isHLSFlow);

  const onJoinPress = () => {
    if (joiningLink.includes('app.100ms.live/')) {
      dispatch(
        saveUserData({
          roomID: joiningLink.replace('meeting', 'preview'),
          isHLSFlow: isHLSFlowEnabled,
        }),
      );
      navigate('WelcomeScreen');
    } else {
      Alert.alert('Error', 'Invalid URL');
    }
  };

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

  useEffect(() => {
    AsyncStorage.getItem(Constants.MEET_URL, (_error, url) => {
      if (url) {
        setJoiningLink(url);
      }
    });
  }, []);

  return (
    <KeyboardAvoidingView
      enabled={Platform.OS === 'ios'}
      behavior="padding"
      style={styles.container}>
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
        keyboardShouldPersistTaps="always">
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
          <View style={styles.joiningFlowContainer}>
            <CustomButton
              title="Meeting"
              onPress={() => setIsHLSFlowEnabled(false)}
              viewStyle={[
                styles.joiningFlowLeft,
                !isHLSFlowEnabled && styles.selectedFlow,
              ]}
              textStyle={[styles.joiningLinkInputText]}
            />
            <CustomButton
              title="HLS"
              onPress={() => setIsHLSFlowEnabled(true)}
              viewStyle={[
                styles.joiningFlowRight,
                isHLSFlowEnabled && styles.selectedFlow,
              ]}
              textStyle={[styles.joiningLinkInputText]}
            />
          </View>
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
    </KeyboardAvoidingView>
  );
};

export {QRCode};
