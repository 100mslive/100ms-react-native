import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  HMSPollQuestionType,
  HMSPollState,
  HMSPollType,
} from '@100mslive/react-native-hms';
import type {
  HMSPoll,
  HMSPollQuestion,
  HMSPollQuestionOption,
} from '@100mslive/react-native-hms';

import {
  useHMSInstance,
  useHMSRoomColorPalette,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import { RadioInputRow } from './RadioInputRow';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { HMSBaseButton } from './HMSBaseButton';
import type { RootState } from '../redux';
import {
  addPollQuestionResponse,
  removePollQuestionResponse,
  setPollQuestionResponse,
} from '../redux/actions';
import { PollResponseProgressView } from './PollResponseProgressView';
import { CheckboxInputRow } from './CheckboxInputRow';
import {
  checkIsCorrectAnswer,
  checkIsCorrectOption,
  checkIsSelected,
  getLabelFromPollQuestionType,
} from '../utils/functions';
import { CheckIcon, CrossCircleIcon } from '../Icons';
import { QuizEndOptionsView } from './QuizEndOptionsView';

export interface PollAndQuizQuestionResponseCardProps {
  pollId: HMSPoll['pollId'];
  pollState: HMSPoll['state'];
  totalQuestions: number;
  pollQuestion: HMSPollQuestion;
  containerStyle?: StyleProp<ViewStyle>;
  onSubmit?: (d: any) => void;
}

export const PollAndQuizQuestionResponseCard: React.FC<
  PollAndQuizQuestionResponseCardProps
> = ({
  pollState,
  totalQuestions,
  pollId,
  pollQuestion,
  containerStyle,
  onSubmit,
}) => {
  const {
    primary_bright: primaryBrightColor,
    on_surface_low: onSurfaceLowColor,
  } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
      borderColor: theme.palette.surface_default,
    },
    surfaceLowSemiBoldText: {
      color: theme.palette.on_surface_low,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    surfaceHighRegularText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    wrongAnswer: {
      borderColor: theme.palette.alert_error_default,
    },
    correctAnswer: {
      borderColor: theme.palette.alert_success,
    },
    wrongAnswerText: {
      color: theme.palette.alert_error_default,
    },
    correctAnswerText: {
      color: theme.palette.alert_success,
    },
    wrongAnswerIcon: {
      tintColor: theme.palette.alert_error_default,
    },
    correctAnswerIcon: {
      tintColor: theme.palette.alert_success,
    },
    skipButton: {
      borderColor: theme.palette.border_bright,
      borderWidth: 1,
      marginRight: 16,
    },
    skipButtonText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
  }));

  // variable to save timestamp when the question became visible to user
  const startTime = React.useRef<number | null>(null);

  React.useEffect(() => {
    startTime.current = Date.now();
  }, [pollQuestion.index]);

  const hmsInstance = useHMSInstance();
  const dispatch = useDispatch();

  const selectedOptions = useSelector(
    (state: RootState) =>
      state.polls.pollsResponses[pollId]?.[pollQuestion.index] ?? null
  );
  const pollType = useSelector(
    (state: RootState) => state.polls.polls[pollId]?.type ?? HMSPollType.poll
  );

  const canViewPollResponse = useSelector((state: RootState) => {
    const localPeerRole = state.hmsStates.localPeer?.role;
    const rolesThatCanViewResponses =
      state.polls.polls[pollId]?.rolesThatCanViewResponses;

    return Array.isArray(rolesThatCanViewResponses) &&
      rolesThatCanViewResponses.length > 0
      ? localPeerRole &&
          rolesThatCanViewResponses.findIndex(
            (role) => role.name === localPeerRole.name
          ) !== -1
      : true;
  });

  const handleOptionSelection = (
    selected: boolean,
    option: HMSPollQuestionOption
  ) => {
    if (pollQuestion.type === HMSPollQuestionType.singleChoice) {
      dispatch(
        setPollQuestionResponse(pollId, pollQuestion.index, option.index)
      );
    } else {
      if (selected) {
        dispatch(
          addPollQuestionResponse(pollId, pollQuestion.index, option.index)
        );
      } else {
        dispatch(
          removePollQuestionResponse(pollId, pollQuestion.index, option.index)
        );
      }
    }
  };

  const handleVotePress = async (e: any) => {
    if (!selectedOptions) {
      return;
    }
    onSubmit?.(e);
    const result = await hmsInstance.interactivityCenter.add({
      pollId,
      pollQuestionIndex: pollQuestion.index,
      responses: {
        options: Array.isArray(selectedOptions)
          ? selectedOptions
          : [selectedOptions],
        duration:
          pollType === HMSPollType.quiz && startTime.current !== null
            ? Date.now() - startTime.current
            : undefined,
      },
    });
    console.log(JSON.stringify(result, null, 4));
  };

  const handleSkipPress = async (e: any) => {
    onSubmit?.(e);
    // TODO: Implement skip API
  };

  const anyOptionSelected = Array.isArray(selectedOptions)
    ? selectedOptions.length > 0
    : selectedOptions !== null;
  const isVoted = pollQuestion.myResponses.length > 0;
  const InputComponent =
    pollQuestion.type === HMSPollQuestionType.singleChoice
      ? RadioInputRow
      : pollQuestion.type === HMSPollQuestionType.multipleChoice
        ? CheckboxInputRow
        : null;

  const isCorrectAnswer = checkIsCorrectAnswer(
    pollQuestion.type,
    pollQuestion.myResponses,
    pollQuestion.answer
  );

  return (
    <View
      style={[
        hmsRoomStyles.container,
        styles.container,
        pollType === HMSPollType.quiz &&
        isVoted &&
        pollState === HMSPollState.stopped
          ? isCorrectAnswer
            ? hmsRoomStyles.correctAnswer
            : hmsRoomStyles.wrongAnswer
          : null,
        containerStyle,
      ]}
    >
      <View style={{ flexDirection: 'row' }}>
        {pollType === HMSPollType.quiz &&
        isVoted &&
        pollState === HMSPollState.stopped ? (
          isCorrectAnswer ? (
            <CheckIcon
              type="in-circle"
              style={[
                hmsRoomStyles.correctAnswerIcon,
                { marginRight: 8, width: 16, height: 16 },
              ]}
            />
          ) : (
            <CrossCircleIcon
              style={[
                hmsRoomStyles.wrongAnswerIcon,
                { marginRight: 8, width: 16, height: 16 },
              ]}
            />
          )
        ) : null}

        <Text
          numberOfLines={2}
          style={[
            styles.tinyText,
            hmsRoomStyles.surfaceLowSemiBoldText,
            styles.uppercaseContent,
            pollType === HMSPollType.quiz &&
            isVoted &&
            pollState === HMSPollState.stopped
              ? isCorrectAnswer
                ? hmsRoomStyles.correctAnswerText
                : hmsRoomStyles.wrongAnswerText
              : null,
          ]}
        >
          Question {pollQuestion.index} of {totalQuestions}:{' '}
          {getLabelFromPollQuestionType(pollQuestion.type)}
        </Text>
      </View>

      <Text
        style={[
          hmsRoomStyles.surfaceHighRegularText,
          styles.regularText,
          styles.verticalNormalSpacer,
        ]}
      >
        {pollQuestion.text}
      </Text>

      {!InputComponent ? null : (
        <>
          {pollType === HMSPollType.poll &&
          canViewPollResponse &&
          (pollQuestion.myResponses.length > 0 ||
            pollState === HMSPollState.stopped) ? (
            <>
              {pollQuestion.options
                ?.sort((a, b) => a.index - b.index)
                .map((option, _, arr) => {
                  return (
                    <PollResponseProgressView
                      key={option.index}
                      option={option}
                      totalVotes={arr.reduce(
                        (acc, curr) => acc + curr.voteCount,
                        0
                      )}
                    />
                  );
                })}
            </>
          ) : pollType === HMSPollType.quiz &&
            pollState === HMSPollState.stopped ? (
            <>
              {pollQuestion.options
                ?.sort((a, b) => a.index - b.index)
                .map((option) => {
                  const isSelected = checkIsSelected(
                    pollQuestion,
                    option,
                    null
                  );
                  const isCorrect = checkIsCorrectOption(
                    pollQuestion.type,
                    option,
                    pollQuestion.answer
                  );
                  return (
                    <QuizEndOptionsView
                      key={option.index}
                      option={option}
                      isSelected={isSelected}
                      isCorrect={isCorrect}
                    />
                  );
                })}
            </>
          ) : (
            <>
              {pollQuestion.options
                ?.sort((a, b) => a.index - b.index)
                .map((option) => {
                  const isSelected = checkIsSelected(
                    pollQuestion,
                    option,
                    selectedOptions
                  );
                  return (
                    <InputComponent
                      key={option.index}
                      disabled={isVoted}
                      selected={isSelected}
                      radioColor={
                        isVoted
                          ? isSelected
                            ? primaryBrightColor
                            : onSurfaceLowColor
                          : undefined
                      }
                      onChange={(selected) =>
                        handleOptionSelection(selected, option)
                      }
                      text={option.text}
                      containerStyle={{ marginBottom: 16 }}
                    />
                  );
                })}
            </>
          )}
        </>
      )}

      {isVoted &&
      (pollType === HMSPollType.poll || pollState === HMSPollState.started) ? (
        <Text
          style={[
            styles.regularText,
            styles.votedLabel,
            hmsRoomStyles.surfaceLowSemiBoldText,
          ]}
        >
          {pollType === HMSPollType.quiz ? 'Answered' : 'Voted'}
        </Text>
      ) : pollState === HMSPollState.started ? (
        <View style={{ alignSelf: 'flex-end', flexDirection: 'row' }}>
          {pollQuestion.skippable ? (
            <HMSBaseButton
              loading={false}
              onPress={handleSkipPress}
              title="Skip"
              style={hmsRoomStyles.skipButton}
              textStyle={hmsRoomStyles.skipButtonText}
              useTouchableOpacity={true}
            />
          ) : null}

          <HMSPrimaryButton
            loading={false}
            disabled={!anyOptionSelected}
            onPress={handleVotePress}
            title={pollType === HMSPollType.quiz ? 'Answer' : 'Vote'}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  tinyText: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
  },
  regularText: {
    fontSize: 16,
    lineHeight: 24,
  },
  verticalNormalSpacer: {
    marginVertical: 16,
  },
  votedLabel: {
    paddingVertical: 8,
    alignSelf: 'flex-end',
  },
  uppercaseContent: {
    textTransform: 'uppercase',
  },
});
