import React, { useState, useMemo } from 'react';
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
import { useSelector } from 'react-redux';
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const device = useCameraDevice('back');

  React.useEffect(() => {
    const checkPermission = async () => {
      const status = await Camera.requestCameraPermission();
      console.log('Camera permission status:', status);
      setHasPermission(status === 'granted');
    };
    checkPermission();
  }, []);

  React.useEffect(() => {
    console.log('QRCodeScanner state:', {
      isFocused,
      hasPermission,
      hasDevice: !!device,
      isScanning,
    });
  }, [isFocused, hasPermission, device, isScanning]);

  // Reset scanning state when screen comes into focus
  React.useEffect(() => {
    if (isFocused) {
      console.log('Screen focused, resetting isScanning to true');
      setIsScanning(true);
    }
  }, [isFocused]);

  const handleCodeScanned = React.useCallback(
    (codes: any[]) => {
      console.log('QR Code scanned:', codes);
      if (!isScanning || codes.length === 0) {
        console.log('Not scanning or no codes:', {
          isScanning,
          codesLength: codes.length,
        });
        return;
      }

      setIsScanning(false);
      const qrCode = codes[0];
      console.log('QR Code value:', qrCode.value);
      const joiningLink = qrCode.value?.replace('meeting', 'preview');

      if (
        joiningLink &&
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
            setIsScanning(true);
          }
        );
      } else {
        goBack();
        Alert.alert('Error', 'Invalid URL');
      }
    },
    [isScanning, staticUserId, debugMode, navigate, goBack]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: handleCodeScanned,
  });

  if (hasPermission === null) {
    // Still checking permission
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
        <View
          style={[
            styles.grow,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
            Checking camera permission...
          </Text>
        </View>
        <CustomButton
          title="Join with Link Instead"
          onPress={goBack}
          viewStyle={styles.joinWithLink}
          textStyle={styles.joinWithLinkText}
        />
      </View>
    );
  }

  if (hasPermission === false) {
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
        <View
          style={[
            styles.grow,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
            Camera permission is required to scan QR codes.
          </Text>
        </View>
        <CustomButton
          title="Join with Link Instead"
          onPress={goBack}
          viewStyle={styles.joinWithLink}
          textStyle={styles.joinWithLinkText}
        />
      </View>
    );
  }

  if (device == null) {
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
        <View
          style={[
            styles.grow,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
            Camera not available
          </Text>
        </View>
        <CustomButton
          title="Join with Link Instead"
          onPress={goBack}
          viewStyle={styles.joinWithLink}
          textStyle={styles.joinWithLinkText}
        />
      </View>
    );
  }

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
      <View style={styles.cameraContainer}>
        {isFocused && device && hasPermission === true ? (
          <>
            {console.log('Rendering Camera with codeScanner:', {
              deviceId: device.id,
              hasCodeScanner: !!codeScanner,
              codeTypes: codeScanner.codeTypes,
            })}
            <Camera
              style={styles.camera}
              device={device}
              isActive={true}
              codeScanner={codeScanner}
            />
          </>
        ) : (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: 'white' }}>
              {!device
                ? 'No camera available'
                : !isFocused
                  ? 'Screen not focused'
                  : 'Loading camera...'}
            </Text>
          </View>
        )}
      </View>
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
