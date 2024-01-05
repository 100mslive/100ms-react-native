import * as React from 'react';
import Modal from 'react-native-modal';
import type { ReactNativeModal } from 'react-native-modal';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  StyleProp,
  TextProps,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

import { CloseIcon } from '../Icons';
import {
  useHMSRoomColorPalette,
  useHMSRoomStyle,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import { useIsLandscapeOrientation } from '../utils/dimension';

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type BottomSheetProps = WithRequired<
  Partial<ReactNativeModal['props']>,
  'isVisible'
> & {
  // closes modal and no action will be taken after modal has been closed
  dismissModal(): void;
  containerStyle?: StyleProp<ViewStyle>;
  bottomOffsetSpace?: number;
  fullWidth?: boolean;
};

export const BottomSheet: React.FC<BottomSheetProps> & {
  Header: React.FC<HeaderProps>;
  Divider: React.FC<BottomSheetDividerProps>;
} = ({
  dismissModal,
  fullWidth = false,
  style,
  children,
  containerStyle,
  bottomOffsetSpace = 32,
  ...resetProps
}) => {
  const { background_dim: backgroundDimColor } = useHMSRoomColorPalette();

  const containerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.background_default,
  }));

  const { handleModalHideAction } = useBottomSheetActionHandlers();

  const isLandscapeOrientation = useIsLandscapeOrientation();

  const Container =
    resetProps.avoidKeyboard && Platform.OS === 'android'
      ? KeyboardAvoidingView
      : View;

  return (
    <Modal
      {...resetProps}
      animationIn={resetProps.animationIn ?? 'slideInUp'}
      animationOut={resetProps.animationOut ?? 'slideOutDown'}
      backdropColor={resetProps.backdropColor ?? backgroundDimColor}
      backdropOpacity={resetProps.backdropOpacity ?? 0.3}
      onBackButtonPress={resetProps.onBackButtonPress ?? dismissModal}
      onBackdropPress={resetProps.onBackdropPress ?? dismissModal}
      useNativeDriver={resetProps.useNativeDriver ?? true}
      useNativeDriverForBackdrop={resetProps.useNativeDriverForBackdrop ?? true}
      hideModalContentWhileAnimating={
        resetProps.hideModalContentWhileAnimating ?? true
      }
      style={[styles.modal, style]}
      onModalHide={resetProps.onModalHide ?? handleModalHideAction}
      supportedOrientations={
        resetProps.supportedOrientations ?? ['portrait', 'landscape']
      }
      statusBarTranslucent={true}
    >
      <Container
        behavior="padding"
        style={[
          isLandscapeOrientation && !fullWidth
            ? styles.landscapeContainer
            : styles.container,
          containerStyles,
          containerStyle,
        ]}
      >
        {children}
        {typeof bottomOffsetSpace === 'number' && bottomOffsetSpace > 0 ? (
          <View style={{ height: bottomOffsetSpace, width: '100%' }} />
        ) : null}
      </Container>
    </Modal>
  );
};

interface HeaderProps {
  dismissModal(): void;
  heading: string;
  subheading?: string;
  headingTestID?: TextProps['testID'];
  subheadingTestID?: TextProps['testID'];
  closeIconTestID?: TouchableOpacityProps['testID'];
}

const BottomSheetHeader: React.FC<HeaderProps> = ({
  dismissModal,
  heading,
  subheading,
  headingTestID,
  subheadingTestID,
  closeIconTestID,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    subheadingText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={styles.header}>
      <View>
        <Text
          testID={headingTestID}
          style={[styles.headerText, hmsRoomStyles.headerText]}
        >
          {heading}
        </Text>

        {subheading ? (
          <Text
            testID={subheadingTestID}
            style={[styles.subheadingText, hmsRoomStyles.subheadingText]}
          >
            {subheading}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        testID={closeIconTestID}
        onPress={dismissModal}
        hitSlop={styles.closeIconHitSlop}
      >
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );
};

interface BottomSheetDividerProps {
  style?: StyleProp<ViewStyle>;
}

const BottomSheetDivider: React.FC<BottomSheetDividerProps> = ({ style }) => {
  const dividerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.border_default,
  }));

  return <View style={[styles.divider, dividerStyles, style]} />;
};

BottomSheet.Header = BottomSheetHeader;

BottomSheet.Divider = BottomSheetDivider;

const onModalHideActionHandlerRef: { handler: null | (() => void) } = {
  handler: null,
};

const useBottomSheetActionHandlers = () => {
  const onModalHideActionRef = React.useRef(onModalHideActionHandlerRef);

  const handleModalHideAction = React.useCallback(() => {
    if (typeof onModalHideActionRef.current.handler === 'function') {
      onModalHideActionRef.current.handler();
    }
    onModalHideActionRef.current.handler = null;
  }, []);

  return { handleModalHideAction };
};

export const useBottomSheetActions = () => {
  const registerOnModalHideAction = React.useCallback((action: () => void) => {
    onModalHideActionHandlerRef.handler = action;
  }, []);

  const clearOnModalHideAction = React.useCallback(() => {
    onModalHideActionHandlerRef.handler = null;
  }, []);

  return { registerOnModalHideAction, clearOnModalHideAction };
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  landscapeContainer: {
    borderRadius: 16,
    width: '60%',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: 24,
  },
  headerText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  subheadingText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  divider: {
    height: 2,
    width: '100%',
    marginVertical: 16,
  },
});
