import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';

import type { AppStackParamList } from '../../navigator';
import { styles } from './styles';
import { CustomButton } from '../../components';
import { callService, validateUrl } from '../../utils/functions';
import { Constants } from '../../utils/types';
import { RootState } from '../../redux';
import { ChevronIcon } from '../../icons';

type QRCodeScannerScreenProp = NativeStackNavigationProp<
  AppStackParamList,
  'QRCodeScannerScreen'
>;

const QRCodeScanner = () => {
  const { navigate, goBack } = useNavigation<QRCodeScannerScreenProp>();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const debugMode = useSelector(
    (state: RootState) => state.app.joinConfig.debugMode
  );
  const staticUserId = useSelector(
    (state: RootState) => state.app.joinConfig.staticUserId
  );
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanned, setIsScanned] = useState(false);

  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (isScanned || codes.length === 0) return;

      setIsScanned(true);
      const qrData = codes[0]?.value;

      if (qrData) {
        const joiningLink = qrData.replace('meeting', 'preview');

        if (
          validateUrl(joiningLink) &&
          joiningLink.includes('app.100ms.live/')
        ) {
          callService(
            joiningLink,
            (
              roomCode: string,
              userId: string,
              tokenEndpoint: string | undefined,
              initEndpoint: string | undefined,
              layoutEndPoint: string | undefined
            ) => {
              // Saving Meeting Link to Async Storage for persisting it between app starts.
              AsyncStorage.setItem(Constants.MEET_URL, joiningLink);
              // @ts-ignore
              navigate('HMSPrebuiltScreen', {
                roomCode,
                userId: staticUserId ? Constants.STATIC_USERID : userId,
                initEndPoint: initEndpoint,
                tokenEndPoint: tokenEndpoint,
                layoutEndPoint: layoutEndPoint,
                debugMode,
              });
            },
            (errorMsg: string) => {
              Toast.showWithGravity(errorMsg, Toast.LONG, Toast.TOP);
              setIsScanned(false);
            }
          );
        } else {
          goBack();
          Alert.alert('Error', 'Invalid URL');
        }
      }
    },
  });

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

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
      ]}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.headerIconContainer} onPress={goBack}>
          <ChevronIcon direction="left" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan QR Code</Text>
      </View>
      {isFocused && device && hasPermission ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
      ) : (
        <View style={styles.grow} />
      )}
      <CustomButton
        title="Join with Link Instead"
        onPress={goBack}
        viewStyle={styles.joinWithLink}
        textStyle={styles.joinWithLinkText}
      />
    </View>
  );
};

export { QRCodeScanner };
