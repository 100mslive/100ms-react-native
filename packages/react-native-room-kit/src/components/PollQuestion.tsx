import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HMSPollQuestionType } from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { BottomSheet } from './BottomSheet';
import { AddIcon, ChevronIcon, TrashBinIcon } from '../Icons';
import { HMSTextInput } from './HMSTextInput';
import { HMSBaseButton } from './HMSBaseButton';
import { PressableIcon } from './PressableIcon';
import type { PollQuestionUI } from '../redux/actionTypes';
import type { RootState } from '../redux';

export interface PollQuestionProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  pollQuestion: PollQuestionUI;
  onAddPollQuestionOption(questionIndex: number): void;
  onDeletePollQuestionOption(questionIndex: number, optionIndex: number): void;
  onEditPollQuestionOption(
    questionIndex: number,
    optionIndex: number,
    option: string
  ): void;
  onQuestionFieldChange: <K extends keyof Omit<PollQuestionUI, 'options'>>(
    questionIndex: number,
    questionField: K,
    value: Omit<PollQuestionUI, 'options'>[K]
  ) => void;
  onDelete(index: number): void;
}

const questionTypes = [
  {
    label: getLabelFromPollQuestionType(HMSPollQuestionType.singleChoice),
    value: HMSPollQuestionType.singleChoice,
    id: 'single-choice',
  },
  {
    label: getLabelFromPollQuestionType(HMSPollQuestionType.multipleChoice),
    value: HMSPollQuestionType.multipleChoice,
    id: 'multiple-choice',
  },
  // {
  //   label: getLabelFromPollQuestionType(HMSPollQuestionType.shortAnswer),
  //   value: HMSPollQuestionType.shortAnswer,
  //   id: 'short-answer',
  // },
  // {
  //   label: getLabelFromPollQuestionType(HMSPollQuestionType.longAnswer),
  //   value: HMSPollQuestionType.longAnswer,
  //   id: 'long-answer',
  // },
];

export const PollQuestion: React.FC<PollQuestionProps> = ({
  totalQuestions,
  currentQuestionIndex,
  pollQuestion,
  onAddPollQuestionOption,
  onDeletePollQuestionOption,
  onEditPollQuestionOption,
  onQuestionFieldChange,
  onDelete,
}) => {
  const [questionTypesVisible, setQuestionTypesVisible] = React.useState(false);
  const launchingPoll = useSelector(
    (state: RootState) => state.polls.launchingPoll
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_default,
    },
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    regularHighText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    semiBoldLowText: {
      color: theme.palette.on_surface_low,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    questionType: {
      backgroundColor: theme.palette.surface_bright,
    },
    floatingQuestionContainer: {
      borderColor: theme.palette.border_default,
      backgroundColor: theme.palette.surface_bright,
    },
    saveButton: {
      backgroundColor: theme.palette.secondary_default,
    },
    saveButtonDisabled: {
      backgroundColor: theme.palette.secondary_dim,
    },
    saveText: {
      color: theme.palette.on_secondary_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    saveTextDisabled: {
      color: theme.palette.on_secondary_low,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    divider: {
      backgroundColor: theme.palette.border_bright,
    },
    dividerV2: {
      backgroundColor: theme.palette.border_default,
    },
    optionText: {
      backgroundColor: theme.palette.surface_bright,
      borderColor: theme.palette.surface_bright,
    },
    optionDeleteIcon: {
      tintColor: theme.palette.on_surface_low,
    },
  }));

  const saveButtonDisabled =
    !pollQuestion.title ||
    ((pollQuestion.type === HMSPollQuestionType.singleChoice ||
      pollQuestion.type === HMSPollQuestionType.multipleChoice) &&
      pollQuestion.options &&
      (pollQuestion.options.length <= 1 ||
        pollQuestion.options.some((option) => !option)));

  if (pollQuestion.saved) {
    return (
      <View style={[styles.container, hmsRoomStyles.container]}>
        <Text
          style={[
            styles.tinyText,
            styles.questionLabel,
            hmsRoomStyles.semiBoldLowText,
          ]}
        >
          Question {currentQuestionIndex + 1} of {totalQuestions}:{' '}
          {getLabelFromPollQuestionType(pollQuestion.type).toUpperCase()}
        </Text>

        {pollQuestion.type === HMSPollQuestionType.singleChoice ||
        pollQuestion.type === HMSPollQuestionType.multipleChoice ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setQuestionTypesVisible((prev) => !prev)}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              { marginBottom: 16 },
            ]}
          >
            <Text style={[styles.normalText, hmsRoomStyles.regularHighText]}>
              {pollQuestion.title}
            </Text>
            <ChevronIcon direction={questionTypesVisible ? 'top' : 'down'} />
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              styles.normalText,
              hmsRoomStyles.regularHighText,
              { marginBottom: 16 },
            ]}
          >
            {pollQuestion.title}
          </Text>
        )}

        {questionTypesVisible && pollQuestion.options ? (
          <View style={{ marginBottom: 8 }}>
            {pollQuestion.options.map((option, idx) => (
              <Text
                key={idx}
                style={[
                  styles.smallText,
                  { marginBottom: 8 },
                  hmsRoomStyles.regularMediumText,
                ]}
              >
                {option}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.saveContainer}>
          <PressableIcon
            disabled={launchingPoll}
            style={[styles.deleteIcon, launchingPoll ? { opacity: 0.4 } : null]}
            onPress={() => onDelete(currentQuestionIndex)}
          >
            <TrashBinIcon />
          </PressableIcon>

          <HMSBaseButton
            loading={false}
            disabled={saveButtonDisabled || launchingPoll}
            onPress={() => {
              setQuestionTypesVisible(false);
              onQuestionFieldChange(
                currentQuestionIndex,
                'saved',
                !pollQuestion.saved
              );
            }}
            title={pollQuestion.saved ? 'Edit' : 'Save'}
            underlayColor={hmsRoomStyles.saveButtonDisabled.backgroundColor}
            style={
              saveButtonDisabled || launchingPoll
                ? hmsRoomStyles.saveButtonDisabled
                : hmsRoomStyles.saveButton
            }
            textStyle={[
              styles.normalText,
              saveButtonDisabled || launchingPoll
                ? hmsRoomStyles.saveTextDisabled
                : hmsRoomStyles.saveText,
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, hmsRoomStyles.container]}>
      <Text
        style={[
          styles.tinyText,
          styles.questionLabel,
          hmsRoomStyles.semiBoldLowText,
        ]}
      >
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </Text>

      <Text
        style={[
          styles.smallText,
          styles.bottomSpace,
          hmsRoomStyles.regularHighText,
        ]}
      >
        Question Type
      </Text>

      <View style={styles.questionTypeWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setQuestionTypesVisible((prev) => !prev)}
          style={[styles.questionType, hmsRoomStyles.questionType]}
        >
          <Text style={[styles.normalText, hmsRoomStyles.regularHighText]}>
            {getLabelFromPollQuestionType(pollQuestion.type)}
          </Text>
          <ChevronIcon direction={questionTypesVisible ? 'top' : 'down'} />
        </TouchableOpacity>

        {questionTypesVisible ? (
          <View
            collapsable={false}
            style={[
              styles.questionTypeOptions,
              { height: 48 * questionTypes.length + 16 },
              hmsRoomStyles.floatingQuestionContainer,
            ]}
          >
            {questionTypes.map((item, idx) => {
              const isFirst = idx === 0;
              return (
                <React.Fragment key={item.id}>
                  {isFirst ? null : (
                    <View
                      style={[
                        styles.questionTypeDivider,
                        hmsRoomStyles.dividerV2,
                      ]}
                    />
                  )}

                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setQuestionTypesVisible((prev) => !prev);
                      onQuestionFieldChange(
                        currentQuestionIndex,
                        'type',
                        item.value
                      );
                    }}
                    style={[
                      styles.questionTypeOption,
                      hmsRoomStyles.questionType,
                    ]}
                  >
                    <Text
                      style={[styles.normalText, hmsRoomStyles.regularHighText]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        ) : null}
      </View>

      <Text
        style={[
          styles.smallText,
          styles.bottomSpace,
          hmsRoomStyles.regularHighText,
        ]}
      >
        Question
      </Text>

      <HMSTextInput
        placeholder="e.g. Who will win the match?"
        style={hmsRoomStyles.optionText}
        value={pollQuestion.title}
        autoFocus={false}
        autoCapitalize="none"
        autoCompleteType="off"
        onChangeText={(value) =>
          onQuestionFieldChange(currentQuestionIndex, 'title', value)
        }
      />

      {pollQuestion.options ? (
        <>
          <BottomSheet.Divider style={hmsRoomStyles.divider} />

          <Text
            style={[
              styles.smallText,
              styles.bottomSpace,
              hmsRoomStyles.regularHighText,
            ]}
          >
            Options
          </Text>

          <View style={styles.optionsWrapper}>
            {pollQuestion.options.map((option, idx) => {
              const isFirst = idx === 0;
              return (
                <View
                  key={idx}
                  style={[
                    styles.optionContainer,
                    isFirst ? null : styles.topSpace,
                  ]}
                >
                  <HMSTextInput
                    placeholder={`Option ${idx + 1}`}
                    style={hmsRoomStyles.optionText}
                    value={option}
                    autoCapitalize="none"
                    autoCompleteType="off"
                    autoFocus={false}
                    onChangeText={(value) =>
                      onEditPollQuestionOption(currentQuestionIndex, idx, value)
                    }
                  />

                  <PressableIcon
                    style={styles.optionDelete}
                    border={false}
                    onPress={() =>
                      onDeletePollQuestionOption(currentQuestionIndex, idx)
                    }
                  >
                    <TrashBinIcon style={hmsRoomStyles.optionDeleteIcon} />
                  </PressableIcon>
                </View>
              );
            })}
          </View>

          <View style={styles.addOptionWrapper}>
            <TouchableOpacity
              style={styles.addOptionContainer}
              onPress={() => onAddPollQuestionOption(currentQuestionIndex)}
            >
              <View style={styles.addOptionIconWrapper}>
                <AddIcon type="circle" />
              </View>
              <Text style={[styles.smallText, hmsRoomStyles.regularMediumText]}>
                Add an option
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      <BottomSheet.Divider style={hmsRoomStyles.divider} />

      <View style={styles.saveContainer}>
        <PressableIcon
          style={styles.deleteIcon}
          onPress={() => onDelete(currentQuestionIndex)}
        >
          <TrashBinIcon />
        </PressableIcon>

        <HMSBaseButton
          loading={false}
          disabled={saveButtonDisabled}
          onPress={() => {
            setQuestionTypesVisible(false);
            onQuestionFieldChange(
              currentQuestionIndex,
              'saved',
              !pollQuestion.saved
            );
          }}
          title={pollQuestion.saved ? 'Edit' : 'Save'}
          underlayColor={hmsRoomStyles.saveButtonDisabled.backgroundColor}
          style={
            saveButtonDisabled
              ? hmsRoomStyles.saveButtonDisabled
              : hmsRoomStyles.saveButton
          }
          textStyle={[
            styles.normalText,
            saveButtonDisabled
              ? hmsRoomStyles.saveTextDisabled
              : hmsRoomStyles.saveText,
          ]}
        />
      </View>
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
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  questionLabel: {
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  questionTypeWrapper: {
    position: 'relative',
    marginBottom: 16,
    zIndex: 40,
  },
  questionType: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
  },
  questionTypeOptions: {
    width: '100%',
    paddingVertical: 8,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 20,
    top: 48 + 4,
    borderWidth: 1,
    borderRadius: 8,
  },
  questionTypeDivider: {
    height: 1,
    width: '90%',
    alignSelf: 'center',
  },
  questionTypeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionsWrapper: {
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionDelete: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  topSpace: {
    marginTop: 8,
  },
  bottomSpace: {
    marginBottom: 8,
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
  config: {
    marginBottom: 16,
  },
  saveContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteIcon: {
    marginRight: 16,
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
