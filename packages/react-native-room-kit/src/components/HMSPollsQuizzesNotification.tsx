import * as React from 'react';
import { batch, useDispatch } from 'react-redux';
import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import type { HMSPoll } from '@100mslive/react-native-hms';
import { HMSPollType, HMSPollUpdateType } from '@100mslive/react-native-hms';

import { PollVoteIcon } from '../Icons';
import {
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
  useModalType,
} from '../hooks-util';
import { HMSNotification } from './HMSNotification';
import { ModalTypes } from '../utils/types';
import {
  pushToNavigationStack,
  removeNotification,
  setSelectedPollId,
} from '../redux/actions';
import { CreatePollStages } from '../redux/actionTypes';

export interface HMSPollsQuizzesNotificationProps {
  id: string;
  payload: any;
}

export const HMSPollsQuizzesNotification: React.FC<
  HMSPollsQuizzesNotificationProps
> = ({ id, payload }) => {
  const { poll, pollUpdateType } = payload as {
    poll: HMSPoll;
    pollUpdateType: HMSPollUpdateType;
  };

  const dispatch = useDispatch();
  const { handleModalVisibleType } = useModalType();
  const { secondary_dim: secondaryDimColor } = useHMSRoomColorPalette();
  // const canVoteOnPoll = useSelector((state: RootState) => {
  //   const permissions = state.hmsStates.localPeer?.role?.permissions;
  //   return permissions?.pollRead;
  // });

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    button: {
      backgroundColor: theme.palette.secondary_default,
    },
    buttonText: {
      color: theme.palette.on_secondary_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const handleVotePress = () => {
    // if (!canVoteOnPoll) {
    //   return;
    // }
    batch(() => {
      dispatch(pushToNavigationStack(CreatePollStages.POLL_VOTING));
      dispatch(setSelectedPollId(poll.pollId));
      handleModalVisibleType(ModalTypes.POLLS_AND_QUIZZES);
      dispatch(removeNotification(id));
    });
  };

  return (
    <HMSNotification
      id={id}
      icon={<PollVoteIcon />}
      text={
        poll.createdBy
          ? `${poll.createdBy.name} ${
              pollUpdateType === HMSPollUpdateType.started ? 'started' : ''
            } a new ${poll.type === HMSPollType.poll ? 'poll' : 'quiz'}`
          : `A new ${poll.type === HMSPollType.poll ? 'poll' : 'quiz'} has started`
      }
      autoDismiss={false}
      dismissable={true}
      cta={
        // canVoteOnPoll ? (
        <GestureDetector gesture={Gesture.Tap()}>
          <TouchableHighlight
            underlayColor={secondaryDimColor}
            style={[styles.button, hmsRoomStyles.button]}
            onPress={handleVotePress}
          >
            <Text style={[styles.buttonText, hmsRoomStyles.buttonText]}>
              {poll.type === HMSPollType.quiz ? 'Answer' : 'Vote'}
            </Text>
          </TouchableHighlight>
        </GestureDetector>
        // ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 16,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
