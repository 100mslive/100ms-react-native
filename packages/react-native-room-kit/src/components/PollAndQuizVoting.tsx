import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { HMSPollQuestionType, HMSPollType } from '@100mslive/react-native-hms';

import { AddIcon } from '../Icons';
import { useHMSInstance, useHMSRoomStyleSheet } from '../hooks-util';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { PollQuestion } from './PollQuestion';
import { batch, useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState } from '../redux';
import {
  addPollQuestion,
  addPollQuestionOption,
  clearPollsState,
  deletePollQuestionOption,
  editPollQuestionOption,
  setLaunchingPoll,
  setPollQDeleteConfirmationVisible,
  setPollQuestionResponseEditable,
  setPollQuestionSaved,
  setPollQuestionSkippable,
  setPollQuestionTitle,
  setPollQuestionType,
  setSelectedPollQuestionIndex,
} from '../redux/actions';
import type { PollQuestionUI } from 'src/redux/actionTypes';
import { PollAndQuizQuestionResponseCard } from './PollAndQuizQuestionResponseCard';

export interface PollAndQuizVotingProps {
  dismissModal(): void;
}

export const PollAndQuizVoting: React.FC<PollAndQuizVotingProps> = ({
  dismissModal,
}) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const reduxStore = useStore<RootState>();
  const localPeerRole = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role
  );
  const selectedPoll = useSelector((state: RootState) => {
    const pollsData = state.polls;
    if (pollsData.selectedPollId !== null) {
      return pollsData.polls[pollsData.selectedPollId] || null;
    }
    return null;
  });
  const launchingPoll = useSelector(
    (state: RootState) => state.polls.launchingPoll
  );
  const questions = useSelector((state: RootState) => state.polls.questions);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    semiBoldMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  const disableLaunchPoll = questions.some(
    (question) =>
      !question.title ||
      (question.options && question.options.some((option) => !option))
  );

  const launchPoll = async () => {
    try {
      const pollsData = reduxStore.getState().polls;

      if (
        !pollsData.pollName ||
        pollsData.questions.some(
          (question) =>
            !question.title ||
            (question.options && question.options.some((option) => !option))
        )
      ) {
        console.log('Incorrect data!');
        return;
      }
      dispatch(setLaunchingPoll(true));

      const result = await hmsInstance.interactivityCenter.startPoll({
        title: pollsData.pollName,
        type: HMSPollType.poll,
        rolesThatCanViewResponses:
          pollsData.pollConfig.voteCountHidden && localPeerRole
            ? [localPeerRole]
            : undefined,
        // mode: HMSPollUserTrackingMode.customerUserID, // mode: null, // `pollsData.pollConfig.resultsAnonymous` Make results anonymous set user tracking mode to none
        questions: pollsData.questions.map((question) => ({
          skippable: question.skippable,
          once: !question.responseEditable,
          text: question.title,
          type: question.type,
          options: question.options?.map((option) => ({ text: option })),
        })),
      });

      console.log('quickStartPoll result > ', result);
      dismissModal();
      dispatch(clearPollsState());
    } catch (error) {
      dispatch(setLaunchingPoll(false));
      console.log('quickStartPoll error > ', error);
    }
  };

  const addQuestion = () => {
    dispatch(addPollQuestion());
  };

  const deleteQuestion = React.useCallback((index: number) => {
    batch(() => {
      dispatch(setSelectedPollQuestionIndex(index));
      dispatch(setPollQDeleteConfirmationVisible(true));
    });
  }, []);

  const onQuestionFieldChange = React.useCallback(
    <K extends keyof Omit<PollQuestionUI, 'options'>>(
      questionIndex: number,
      questionField: K,
      value: Omit<PollQuestionUI, 'options'>[K]
    ) => {
      switch (questionField) {
        case 'responseEditable':
          dispatch(
            setPollQuestionResponseEditable(questionIndex, value as boolean)
          );
          break;
        case 'saved':
          dispatch(setPollQuestionSaved(questionIndex, value as boolean));
          break;
        case 'skippable':
          dispatch(setPollQuestionSkippable(questionIndex, value as boolean));
          break;
        case 'title':
          dispatch(setPollQuestionTitle(questionIndex, value as string));
          break;
        case 'type':
          dispatch(
            setPollQuestionType(questionIndex, value as HMSPollQuestionType)
          );
          break;
      }
    },
    []
  );

  const handleAddPollQuestionOption = React.useCallback(
    (questionIndex: number) => {
      dispatch(addPollQuestionOption(questionIndex));
    },
    []
  );

  const handleDeletePollQuestionOption = React.useCallback(
    (questionIndex: number, optionIndex: number) => {
      dispatch(deletePollQuestionOption(questionIndex, optionIndex));
    },
    []
  );

  const handleEditPollQuestionOption = React.useCallback(
    (questionIndex: number, optionIndex: number, option: string) => {
      dispatch(editPollQuestionOption(questionIndex, optionIndex, option));
    },
    []
  );

  const handleVote = (e: any) => {
    const handle = findNodeHandle(e.nativeEvent.target);
    const scrollHandle = findNodeHandle(scrollViewRef.current);
    if (!handle) {
      return;
    }
    if (scrollHandle === null) {
      return;
    }
    UIManager.measureLayout(
      handle,
      scrollHandle,
      () => {
        console.log('Failed', e);
      },
      (left, top, width, height) => {
        console.log('Success', { left, top, width, height });

        scrollViewRef.current?.scrollTo({
          y: top + 400,
          animated: true,
        });
      }
    );
  };

  const pollHasQuestions =
    selectedPoll &&
    Array.isArray(selectedPoll.questions) &&
    selectedPoll.questions.length > 0;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.contentContainer}
      contentContainerStyle={{ paddingTop: 24 }}
    >
      <Text style={[styles.normalText, hmsRoomStyles.semiBoldMediumText]}>
        {selectedPoll?.createdBy?.name} started this poll
      </Text>

      {selectedPoll?.questions
        ?.sort((a, b) => a.index - b.index)
        .map((question, _, arr) => (
          <PollAndQuizQuestionResponseCard
            key={question.index}
            pollId={selectedPoll.pollId}
            totalQuestions={arr.length}
            pollQuestion={question}
            containerStyle={{ marginBottom: 16 }}
            onSubmit={handleVote}
          />
        ))}

      {/* <HMSPrimaryButton
        disabled={!pollHasQuestions || disableLaunchPoll || launchingPoll}
        title="Submit"
        loading={launchingPoll}
        onPress={launchPoll}
        style={{ marginTop: 16, marginBottom: 56, alignSelf: 'flex-end' }}
      /> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  typeSelectionLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  pollNameLabel: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  textInput: {
    flex: undefined,
  },

  addOptionWrapper: {
    alignSelf: 'flex-start',
  },
  addOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addOptionIconWrapper: {
    marginRight: 8,
    padding: 8,
  },
});
