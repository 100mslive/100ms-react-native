import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux';
import {
  isPublishingAllowed,
  useHMSInstance,
  useHMSRoomStyleSheet,
  useModalType,
} from '../hooks-util';
import { BottomSheet, useBottomSheetActions } from './BottomSheet';
import { ChevronIcon, CloseIcon } from '../Icons';
import { HMSTextInput } from './HMSTextInput';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { useHMSActions } from '../hooks-sdk';
import { ModalTypes } from '../utils/types';
import { TestIds } from '../utils/constants';
import {
  HMSPollBuilder,
  HMSPollQuestionBuilder,
  HMSPollQuestionType,
} from '@100mslive/react-native-hms';

export interface PollsAndQuizzesModalContentProps {
  dismissModal(): void;
}

export const PollsAndQuizzesModalContent: React.FC<
  PollsAndQuizzesModalContentProps
> = ({ dismissModal }) => {
  const hmsInstance = useHMSInstance();
  const localPeerRole = useSelector((state: RootState) => {
    return state.hmsStates.localPeer?.role;
  });
  // const hmsActions = useHMSActions();
  const isPublisher = useSelector((state: RootState) => {
    const localPeer = state.hmsStates.localPeer;
    return localPeer ? isPublishingAllowed(localPeer) : false;
  });

  const { handleModalVisibleType } = useModalType();

  const { registerOnModalHideAction } = useBottomSheetActions();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

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

  const launchPoll = async () => {
    try {
      const pollBuilder = new HMSPollBuilder();
      pollBuilder.withTitle('Feedback Form');
      if (localPeerRole) {
        pollBuilder.withRolesThatCanViewResponses([localPeerRole]);
      }

      const pollQuestionBuilder = new HMSPollQuestionBuilder();

      pollQuestionBuilder.withTitle('Any Other Feedback?');
      pollQuestionBuilder.withCanBeSkipped(true);
      pollQuestionBuilder.withType(HMSPollQuestionType.shortAnswer);

      pollBuilder.addQuestion(pollQuestionBuilder);

      pollBuilder.addSingleChoiceQuestion('What would you rate us?', [
        '1 Star',
        '2 Star',
        '3 Star',
        '4 Star',
        '5 Star',
      ]);

      pollBuilder.addMultiChoiceQuestion('What did you like about us?', [
        'Fast Speed',
        'Good DevEx',
        'Reliable',
        'Features',
      ]);

      const r =
        await hmsInstance.interactivityCenter.quickStartPoll(pollBuilder);
      console.log('result - ', r);
    } catch (error) {
      console.log('error - ', error);
    }
  };

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerControls}>
          {/* {isPublisher ? null : (
            <TouchableOpacity
              onPress={handleBackPress}
              hitSlop={styles.closeIconHitSlop}
              style={styles.backIcon}
            >
              <ChevronIcon direction="left" />
            </TouchableOpacity>
          )} */}

          <Text
            testID={TestIds.change_name_modal_heading}
            style={[styles.headerText, hmsRoomStyles.headerText]}
          >
            Polls and Quizzes
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
        <HMSPrimaryButton
          title="Launch Poll"
          onPress={launchPoll}
          loading={false}
          disabled={false}
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
