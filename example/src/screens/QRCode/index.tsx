import React, {useEffect, useState} from 'react';
import {Image, Linking, ScrollView, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import type {AppStackParamList} from '../../navigator';
import {styles} from './styles';
import {getMeetingUrl, validateUrl} from '../../utils/functions';
import {COLORS} from '../../utils/theme';
import {CustomButton, CustomInput} from '../../components';

type QRCodeScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'QRCodeScreen'
>;

const QRCode = () => {
  const navigate = useNavigation<QRCodeScreenProp>().navigate;
  const {top, bottom, left, right} = useSafeAreaInsets();

  const [joinDisabled, setJoinDisabled] = useState<boolean>(true);
  const [joiningLink, setJoiningLink] = useState<string>(getMeetingUrl());

  const onJoiningLinkChange = (value: string) => {
    setJoiningLink(value);
    setJoinDisabled(!validateUrl(value));
  };

  const onJoinPress = () => {
    //
  };

  const onScanQRCodePress = () => {
    navigate('QRCodeScannerScreen');
  };

  useEffect(() => {
    setJoinDisabled(!validateUrl(joiningLink));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then(url => {
      if (url) {
        onJoiningLinkChange(url);
      }
    });

    const updateUrl = ({url}: {url: string}) => {
      if (url) {
        onJoiningLinkChange(url);
      }
    };
    Linking.addEventListener('url', updateUrl);

    return () => {
      Linking.removeEventListener('url', updateUrl);
    };
  }, []);

  return (
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
      style={styles.container}>
      <Image
        style={styles.image}
        resizeMode="stretch"
        source={require('../../../assets/Illustration.png')}
      />
      <View>
        <Text style={styles.heading}>Stream right from your mobile!</Text>
        <Text style={styles.description}>
          Login or scan the QR code from the app to get started
        </Text>
      </View>
      <CustomInput
        value={joiningLink}
        onChangeText={onJoiningLinkChange}
        textStyle={styles.joiningLinkInputText}
        viewStyle={styles.joiningLinkInputView}
        inputStyle={styles.joiningLinkInput}
        placeholderTextColor={COLORS.TEXT.DISABLED}
        placeholder="Paste the link here"
        title="Joining Link"
        multiline
      />
      <CustomButton
        title="Join Now"
        onPress={onJoinPress}
        disabled={joinDisabled}
        viewStyle={[styles.joinButton, joinDisabled && styles.disabled]}
        textStyle={[styles.joinButtonText, joinDisabled && styles.disabledText]}
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
  );
};

export {QRCode};
