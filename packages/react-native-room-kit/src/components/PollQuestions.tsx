import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';
import { HMSPollQuestionType, HMSPollType } from '@100mslive/react-native-hms';
import { batch, useDispatch, useSelector, useStore } from 'react-redux';

import { AddIcon, ChevronIcon, CloseIcon } from '../Icons';
import { useHMSInstance, useHMSRoomStyleSheet } from '../hooks-util';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { PollQuestion } from './PollQuestion';
import type { RootState } from '../redux';
import {
  addPollQuestion,
  addPollQuestionOption,
  cleaPollFormState,
  deletePollQuestionOption,
  editPollQuestionOption,
  popFromNavigationStack,
  setLaunchingPoll,
  setPollQDeleteConfirmationVisible,
  setPollQuestionCorrectOption,
  setPollQuestionPointWeightage,
  setPollQuestionResponseEditable,
  setPollQuestionSaved,
  setPollQuestionSkippable,
  setPollQuestionTitle,
  setPollQuestionType,
  setSelectedPollQuestionIndex,
} from '../redux/actions';
import type { PollQuestionUI } from '../redux/actionTypes';
import { PollQDeleteConfirmationSheetView } from './PollQDeleteConfirmationSheetView';
import { BottomSheet } from './BottomSheet';

export interface PollQuestionsProps {
  currentIdx: number;
  dismissModal(): void;
  unmountScreenWithAnimation?: (cb: Function) => void;
}

export const PollQuestions: React.FC<PollQuestionsProps> = ({
  currentIdx,
  dismissModal,
  unmountScreenWithAnimation,
}) => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const reduxStore = useStore<RootState>();
  const localPeerRole = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role
  );
  const launchingPoll = useSelector(
    (state: RootState) => state.polls.launchingPoll
  );
  const pollType = useSelector(
    (state: RootState) => state.polls.pollConfig.type
  );
  const headerTitle = useSelector((state: RootState) => state.polls.pollName);
  const questions = useSelector((state: RootState) => state.polls.questions);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    container: {
      backgroundColor: theme.palette.surface_dim,
    },
  }));

  const disableLaunchPoll =
    questions.length <= 0 || questions.some((question) => !question.saved);

  const launchPoll = async () => {
    try {
      const pollsData = reduxStore.getState().polls;
      if (!pollsData.pollName || disableLaunchPoll) {
        console.log('Incorrect data!');
        return;
      }
      dispatch(setLaunchingPoll(true));

      const result = await hmsInstance.interactivityCenter.startPoll({
        title: pollsData.pollName,
        type: pollType,
        rolesThatCanViewResponses:
          pollType === HMSPollType.poll &&
          pollsData.pollConfig.voteCountHidden &&
          localPeerRole
            ? [localPeerRole]
            : undefined,
        // mode: HMSPollUserTrackingMode.customerUserID, // mode: null, // `pollsData.pollConfig.resultsAnonymous` Make results anonymous set user tracking mode to none
        questions: pollsData.questions.map((question) => {
          const weight = parseInt(question.pointWeightage);
          return {
            skippable: question.skippable,
            once: !question.responseEditable,
            text: question.title,
            type: question.type,
            weight:
              pollType === HMSPollType.quiz && !isNaN(weight)
                ? weight
                : undefined,
            options: question.options?.map((option) =>
              pollType === HMSPollType.quiz
                ? { text: option[1], isCorrectAnswer: option[0] }
                : { text: option[1] }
            ),
          };
        }),
      });

      console.log('quickStartPoll result > ', result);
      dispatch(cleaPollFormState());
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
        case 'pointWeightage':
          const cleanNumber = (value as string).replace(/[^0-9]/g, '');
          dispatch(setPollQuestionPointWeightage(questionIndex, cleanNumber));
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

  const handleSetPollQuestionCorrectOption = React.useCallback(
    (questionIndex: number, optionIndex: number, corectOption: boolean) => {
      dispatch(
        setPollQuestionCorrectOption(questionIndex, optionIndex, corectOption)
      );
    },
    []
  );

  const handleBackPress = () => {
    Keyboard.dismiss();
    if (typeof unmountScreenWithAnimation === 'function') {
      unmountScreenWithAnimation(() => dispatch(popFromNavigationStack()));
    } else {
      dispatch(popFromNavigationStack());
    }
  };

  const handleClosePress = () => {
    Keyboard.dismiss();
    dismissModal();
  };

  return (
    <View style={[styles.fullView, hmsRoomStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerControls}>
          {currentIdx > 0 ? (
            <TouchableOpacity
              onPress={handleBackPress}
              disabled={launchingPoll}
              hitSlop={styles.closeIconHitSlop}
              style={[styles.backIcon, launchingPoll ? { opacity: 0.4 } : null]}
            >
              <ChevronIcon direction="left" />
            </TouchableOpacity>
          ) : null}

          <Text
            numberOfLines={2}
            style={[
              styles.headerText,
              { flexShrink: 1 },
              hmsRoomStyles.headerText,
            ]}
          >
            {headerTitle}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClosePress}
          hitSlop={styles.closeIconHitSlop}
          style={{ marginLeft: 16 }}
        >
          <CloseIcon />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <BottomSheet.Divider style={styles.halfDivider} />

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingTop: 24 }}
      >
        {questions.map((pollQuestion, idx, arr) => {
          const isFirst = idx === 0;
          return (
            <React.Fragment key={idx}>
              {isFirst ? null : <View style={{ height: 16 }} />}

              <PollQuestion
                totalQuestions={arr.length}
                currentQuestionIndex={idx}
                pollQuestion={pollQuestion}
                onAddPollQuestionOption={handleAddPollQuestionOption}
                onDeletePollQuestionOption={handleDeletePollQuestionOption}
                onEditPollQuestionOption={handleEditPollQuestionOption}
                onSetPollQuestionCorrectOption={
                  handleSetPollQuestionCorrectOption
                }
                onQuestionFieldChange={onQuestionFieldChange}
                onDelete={deleteQuestion}
              />
            </React.Fragment>
          );
        })}

        <View style={[styles.addOptionWrapper, { marginTop: 16 }]}>
          <TouchableOpacity
            onPress={addQuestion}
            disabled={launchingPoll}
            style={[
              styles.addOptionContainer,
              launchingPoll ? { opacity: 0.4 } : null,
            ]}
          >
            <View style={styles.addOptionIconWrapper}>
              <AddIcon type="circle" />
            </View>
            <Text style={[styles.smallText, hmsRoomStyles.regularMediumText]}>
              Add another question
            </Text>
          </TouchableOpacity>
        </View>

        <HMSPrimaryButton
          disabled={disableLaunchPoll || launchingPoll}
          title={`Launch ${pollType === HMSPollType.quiz ? 'Quiz' : 'Poll'}`}
          loading={launchingPoll}
          onPress={launchPoll}
          style={{ marginTop: 16, marginBottom: 56, alignSelf: 'flex-end' }}
        />
      </ScrollView>

      {/* Modal */}
      <PollQDeleteConfirmationSheetView />
    </View>
  );
};

const styles = StyleSheet.create({
  smallText: {
    fontSize: 14,
    lineHeight: 20,
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

  // -------

  // Utilities
  fullView: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 24,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  headerText: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    marginRight: 12,
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
  // Divider
  halfDivider: {
    marginHorizontal: 24,
    marginVertical: 0,
    marginTop: 24,
    width: undefined,
  },
  divider: {
    marginHorizontal: 24,
    marginVertical: 24,
    width: undefined,
  },
});
