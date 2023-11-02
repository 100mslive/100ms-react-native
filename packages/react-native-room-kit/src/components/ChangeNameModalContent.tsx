import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import { isPublishingAllowed, useHMSRoomStyleSheet, useModalType } from '../hooks-util';
import { BottomSheet, useBottomSheetActions } from './BottomSheet';
import { ChevronIcon, CloseIcon } from '../Icons';
import { HMSTextInput } from './HMSTextInput';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { useHMSActions } from '../hooks-sdk';
import { ModalTypes } from '../utils/types';
import { TestIds } from '../utils/constants';

export interface ChangeNameModalContentProps {
  dismissModal(): void;
}

export const ChangeNameModalContent: React.FC<ChangeNameModalContentProps> = ({
  dismissModal,
}) => {
  const hmsActions = useHMSActions();
  const localPeerName = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.name || ''
  );
  const isPublisher = useSelector((state: RootState) => {
    const localPeer = state.hmsStates.localPeer;
    return localPeer ? isPublishingAllowed(localPeer) : false;
  });

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
  };

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
          {isPublisher ? null : (
            <TouchableOpacity
              onPress={handleBackPress}
              hitSlop={styles.closeIconHitSlop}
              style={styles.backIcon}
            >
              <ChevronIcon direction="left" />
            </TouchableOpacity>
          )}

          <Text
            testID={TestIds.change_name_modal_heading}
            style={[styles.headerText, hmsRoomStyles.headerText]}
          >
            Change Name
          </Text>
        </View>

        <TouchableOpacity
          testID={TestIds.change_name_modal_close_btn}
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
        <HMSTextInput
          testID={TestIds.change_name_input}
          style={styles.textInput}
          value={name}
          autoFocus={true}
          onChangeText={setName}
        />

        <HMSPrimaryButton
          testId={TestIds.change_name_modal_cta}
          loading={nameChangeLoading}
          onPress={changeName}
          title="Change"
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
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  closeIconHitSlop: {
    bottom: 16,
    left: 16,
    right: 16,
    top: 16,
  },
  backIcon: {
    marginRight: 8,
  },
  contentContainer: {
    marginHorizontal: 24,
  },
  textInput: {
    flex: undefined,
    marginBottom: 16,
  },
});
