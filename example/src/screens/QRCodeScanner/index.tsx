import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BarCodeReadEvent, RNCamera} from 'react-native-camera';
import QRScanner from 'react-native-qrcode-scanner';
import {useDispatch} from 'react-redux';

import type {AppStackParamList} from '../../navigator';
import {styles} from './styles';
import {CustomButton} from '../../components';
import {saveUserData} from '../../redux/actions';

type WelcomeScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'WelcomeScreen'
>;

const QRCodeScanner = () => {
  const navigate = useNavigation<WelcomeScreenProp>().navigate;
  const dispatch = useDispatch();
  const {top, bottom, left, right} = useSafeAreaInsets();

  const onBackPress = () => {
    navigate('QRCodeScreen');
  };

  const onScanSuccess = (e: BarCodeReadEvent) => {
    dispatch(
      saveUserData({
        roomID: e.data.replace('meeting', 'preview'),
      }),
    );
    navigate('WelcomeScreen');
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: 24 + top,
          paddingLeft: 24 + left,
          paddingRight: 24 + right,
          paddingBottom: 24 + bottom,
        },
      ]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={onBackPress}>
          <Ionicons size={24} style={styles.headerIcon} name="chevron-back" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan QR Code</Text>
      </View>
      <QRScanner
        onRead={onScanSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
      />
      <CustomButton
        title="Join with Link Instead"
        onPress={onBackPress}
        viewStyle={styles.joinWithLink}
        textStyle={styles.joinWithLinkText}
        LeftIcon={
          <Ionicons size={24} style={styles.joinWithLinkIcon} name="link" />
        }
      />
    </View>
  );
};

export {QRCodeScanner};
