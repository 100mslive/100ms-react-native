import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
  deletePollQuestionOption,
  editPollQuestionOption,
  setPollQDeleteConfirmationVisible,
  setPollQuestionResponseEditable,
  setPollQuestionSaved,
  setPollQuestionSkippable,
  setPollQuestionTitle,
  setPollQuestionType,
  setSelectedPollQuestionIndex,
} from '../redux/actions';
import type { PollQuestionUI } from 'src/redux/actionTypes';

export interface CreatePollProps {}

export const PollQuestions: React.FC<CreatePollProps> = ({}) => {
  const dispatch = useDispatch();
  const hmsInstance = useHMSInstance();
  const reduxStore = useStore<RootState>();
  const localPeerRole = useSelector(
    (state: RootState) => state.hmsStates.localPeer?.role
  );
  const questions = useSelector((state: RootState) => state.polls.questions);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
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
      // const pollBuilder = new HMSPollBuilder();

      // pollBuilder.withTitle(pollsData.pollName);

      // if (pollsData.pollConfig.voteCountHidden) {
      //   if (localPeerRole) {
      //     pollBuilder.withRolesThatCanViewResponses([localPeerRole]);
      //   } else {
      //     console.error('Local Peer role is undefined!');
      //   }
      // }

      // Make results anonymous set user tracking mode to none
      // if (pollsData.pollConfig.resultsAnonymous) {
      //   pollBuilder.withUserTrackingMode(HMSPollUserTrackingMode)
      //   // DOUBT: How to handle `pollBuilder.withUserTrackingMode()` ?
      // }

      // pollsData.questions.forEach((question) => {
      //   const pollQuestionBuilder = new HMSPollQuestionBuilder();
      //   pollQuestionBuilder.withType(question.type);
      //   pollQuestionBuilder.withTitle(question.title);

      //   pollQuestionBuilder.withCanBeSkipped(question.skippable);

      //   // DOUBT: How to handle `question.responseEditable` ?

      //   if (question.options) {
      //     question.options.forEach((option) => {
      //       pollQuestionBuilder.addOption(option);
      //     });
      //   }
      //   pollBuilder.addQuestion(pollQuestionBuilder);
      // });

      const result = await hmsInstance.interactivityCenter.startPoll({
        title: 'Custom Poll',
        type: HMSPollType.poll,
        questions: [
          {
            type: HMSPollQuestionType.multipleChoice,
            skippable: true,
            text: 'How will win?',
            options: [
              { text: 'India' },
              { text: 'Australia' },
              { text: 'China' },
            ],
          },
        ],
      });
      console.log('quickStartPoll result > ', result);
    } catch (error) {
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

  return (
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
              onQuestionFieldChange={onQuestionFieldChange}
              onDelete={deleteQuestion}
            />
          </React.Fragment>
        );
      })}

      <View style={[styles.addOptionWrapper, { marginTop: 16 }]}>
        <TouchableOpacity
          onPress={addQuestion}
          style={styles.addOptionContainer}
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
        disabled={disableLaunchPoll}
        title="Launch Poll"
        loading={false}
        onPress={launchPoll}
        style={{ marginTop: 16, marginBottom: 56, alignSelf: 'flex-end' }}
      />
    </ScrollView>
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
});
