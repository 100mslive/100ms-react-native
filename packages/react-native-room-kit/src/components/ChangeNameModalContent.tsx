import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { useHMSRoomStyleSheet, useModalType } from '../hooks-util';
import { BottomSheet, useBottomSheetActions } from './BottomSheet';
import { ChevronIcon, CloseIcon } from '../Icons';
import { ModalTypes } from '../utils/types';
import { HMSTextInput } from './HMSTextInput';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { useHMSActions } from '../hooks-sdk';

export interface ChangeNameModalContentProps {
  dismissModal(): void;
}

export const ChangeNameModalContent: React.FC<ChangeNameModalContentProps> = ({ dismissModal }) => {
  const hmsActions = useHMSActions();
  const localPeerName = useSelector((state: RootState) => state.hmsStates.localPeer?.name || '');

  const [name, setName] = React.useState(localPeerName);
  const [nameChangeLoading, setNameChangeLoading] = React.useState(false);
  const { handleModalVisibleType } = useModalType();

  const { registerOnModalHideAction } = useBottomSheetActions();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const invalidName = name.trim().length <= 0;
  const disabledButton = nameChangeLoading || invalidName;

  const handleBackPress = () => {
    Keyboard.dismiss();

    // Open SETTINGS bottom sheet when current sheet is closed
    registerOnModalHideAction(() => {
      handleModalVisibleType(ModalTypes.SETTINGS);
    });

    // Close current bottom sheet
    dismissModal();
  };

  const handleClosePress = () => {
    Keyboard.dismiss();
    dismissModal();
  }

  const changeName = async () => {
    if (invalidName) return;

    setNameChangeLoading(true);
    try {
      await hmsActions.changeName(name);
      Keyboard.dismiss();
      dismissModal();
    } catch (error) {
      setNameChangeLoading(false);
    }
  };

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerControls}>
          <TouchableOpacity
            onPress={handleBackPress}
            hitSlop={styles.closeIconHitSlop}
          >
            <ChevronIcon direction='left' />
          </TouchableOpacity>

          <Text style={[styles.headerText, hmsRoomStyles.headerText]}>
            Change Name
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClosePress}
          hitSlop={styles.closeIconHitSlop}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <BottomSheet.Divider />

      {/* Content */}
      <View style={styles.contentContainer}>
        <HMSTextInput style={styles.textInput} value={name} autoFocus={true} onChangeText={setName} />

        <HMSPrimaryButton
          loading={nameChangeLoading}
          onPress={changeName}
          title='Change'
          disabled={disabledButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: 24,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginLeft: 8,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  contentContainer: {
    marginHorizontal: 24
  },
  textInput: {
    flex: undefined,
    marginBottom: 16
  }
});
