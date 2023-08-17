import * as React from 'react';
import Modal from 'react-native-modal';
import type { ReactNativeModal } from 'react-native-modal';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CloseIcon } from '../Icons';
import {
  useHMSRoomColorPalette,
  useHMSRoomStyle,
  useHMSRoomStyleSheet,
} from '../hooks-util';

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type BottomSheetProps = WithRequired<
  Partial<ReactNativeModal['props']>,
  'isVisible'
> & {
  // closes modal and no action will be taken after modal has been closed
  dismissModal(): void;
};

export const BottomSheet: React.FC<BottomSheetProps> & {
  Header: React.FC<HeaderProps>;
  Divider: React.FC;
} = ({ dismissModal, style, children, ...resetProps }) => {
  const { background_dim: backgroundDimColor } = useHMSRoomColorPalette();

  const containerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.background_default,
  }));

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
    >
      <View style={[styles.container, containerStyles]}>{children}</View>
    </Modal>
  );
};

interface HeaderProps {
  dismissModal(): void;
  heading: string;
  subheading?: string;
}

const BottomSheetHeader: React.FC<HeaderProps> = ({
  dismissModal,
  heading,
  subheading,
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
        <Text style={[styles.headerText, hmsRoomStyles.headerText]}>
          {heading}
        </Text>

        {subheading ? (
          <Text style={[styles.subheadingText, hmsRoomStyles.subheadingText]}>
            {subheading}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={dismissModal}
        hitSlop={styles.closeIconHitSlop}
      >
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );
};

const BottomSheetDivider: React.FC = () => {
  const dividerStyles = useHMSRoomStyle((theme) => ({
    backgroundColor: theme.palette.border_default,
  }));

  return <View style={[styles.divider, dividerStyles]} />;
};

BottomSheet.Header = BottomSheetHeader;

BottomSheet.Divider = BottomSheetDivider;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
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
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
});
