import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { HMSPollQuestionType } from '@100mslive/react-native-hms';
import type { HMSPoll, HMSPollQuestion } from '@100mslive/react-native-hms';

import { useHMSRoomColorPalette, useHMSRoomStyleSheet } from '../hooks-util';
import { RadioInputRow } from './RadioInputRow';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { HMSBaseButton } from './HMSBaseButton';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/redux';

export interface PollAndQuizQuestionResponseCardProps {
  pollId: HMSPoll['pollId'];
  totalQuestions: number;
  pollQuestion: HMSPollQuestion;
  containerStyle?: StyleProp<ViewStyle>;
  onSubmit?: (d: any) => void;
}

export const PollAndQuizQuestionResponseCard: React.FC<
  PollAndQuizQuestionResponseCardProps
> = ({ totalQuestions, pollId, pollQuestion, containerStyle, onSubmit }) => {
  const {
    primary_bright: primaryBrightColor,
    on_surface_low: onSurfaceLowColor,
  } = useHMSRoomColorPalette();

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
    },
    surfaceLowSemiBoldText: {
      color: theme.palette.on_surface_low,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    surfaceHighRegularText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
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

  const selectedOptions = useSelector(
    (state: RootState) =>
      state.polls.pollsResponses[pollId]?.[pollQuestion.index] ?? null
  );

  return (
    <View style={[hmsRoomStyles.container, styles.container, containerStyle]}>
      <Text
        style={[
          styles.tinyText,
          hmsRoomStyles.surfaceLowSemiBoldText,
          styles.uppercaseContent,
        ]}
      >
        Question {pollQuestion.index} of {totalQuestions}:{' '}
        {getLabelFromPollQuestionType(pollQuestion.type)}
      </Text>

      <Text
        style={[
          hmsRoomStyles.surfaceHighRegularText,
          styles.regularText,
          styles.verticalNormalSpacer,
        ]}
      >
        {pollQuestion.text}
      </Text>

      {pollQuestion.options
        ?.sort((a, b) => a.index - b.index)
        .map((option) => (
          <RadioInputRow
            key={option.index}
            selected={false} // TODO: add state here
            radioColor={onSurfaceLowColor}
            onChange={() => {}}
            text={option.text}
            containerStyle={{ marginBottom: 16 }}
          />
        ))}

      {!true ? (
        <Text
          style={[
            styles.regularText,
            styles.votedLabel,
            hmsRoomStyles.surfaceLowSemiBoldText,
          ]}
        >
          Voted
        </Text>
      ) : (
        <View style={{ alignSelf: 'flex-end', flexDirection: 'row' }}>
          {pollQuestion.skippable ? (
            <HMSBaseButton
              loading={false}
              onPress={(e) => onSubmit?.(e)}
              title="Skip"
              style={hmsRoomStyles.skipButton}
              textStyle={hmsRoomStyles.skipButtonText}
              useTouchableOpacity={true}
            />
          ) : null}

          <HMSPrimaryButton
            loading={false}
            disabled={true}
            onPress={(e) => {
              onSubmit?.(e);
            }}
            title="Vote"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
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

function getLabelFromPollQuestionType(type: HMSPollQuestionType): string {
  switch (type) {
    case HMSPollQuestionType.singleChoice:
      return 'Single Choice';
    case HMSPollQuestionType.multipleChoice:
      return 'Multiple Choice';
    case HMSPollQuestionType.longAnswer:
      return 'Long Answer';
    case HMSPollQuestionType.shortAnswer:
      return 'Short Answer';
  }
}
