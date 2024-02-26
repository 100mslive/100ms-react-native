import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { HMSPollQuestionType, HMSPollType } from '@100mslive/react-native-hms';
import { useSelector } from 'react-redux';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { BottomSheet } from './BottomSheet';
import { AddIcon, CheckBoxIcon, ChevronIcon, TrashBinIcon } from '../Icons';
import { HMSTextInput } from './HMSTextInput';
import { HMSBaseButton } from './HMSBaseButton';
import { PressableIcon } from './PressableIcon';
import type { PollQuestionUI } from '../redux/actionTypes';
import type { RootState } from '../redux';
import { RadioInput } from './RadioInput';

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
  onSetPollQuestionCorrectOption(
    questionIndex: number,
    optionIndex: number,
    correctOption: boolean
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
  onSetPollQuestionCorrectOption,
  onQuestionFieldChange,
  onDelete,
}) => {
  const [questionTypesVisible, setQuestionTypesVisible] = React.useState(false);
  const launchingPoll = useSelector(
    (state: RootState) => state.polls.launchingPoll
  );
  const pollType = useSelector(
    (state: RootState) => state.polls.pollConfig.type
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
    // Disable save button if:
    !pollQuestion.title || // title is not vaild, OR
    !pollQuestion.pointWeightage || // pointWeightage is not valid, OR
    ((pollQuestion.type === HMSPollQuestionType.singleChoice ||
      pollQuestion.type === HMSPollQuestionType.multipleChoice) && // If question type is singleChoice or multipleChoice, AND
      pollQuestion.options && // options are defined
      (pollQuestion.options.length <= 1 || // options are less than or equal to 1, OR
        pollQuestion.options.some((option) => !option[1]) || // some options are not valid, OR
        (pollType === HMSPollType.quiz &&
          pollQuestion.options.every((option) => !option[0])))); // If poll type is quiz, all options are marked as not correct

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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={[styles.normalText, hmsRoomStyles.regularHighText]}>
              {pollQuestion.title}
            </Text>
            <ChevronIcon direction={questionTypesVisible ? 'top' : 'down'} />
          </TouchableOpacity>
        ) : (
          <Text style={[styles.normalText, hmsRoomStyles.regularHighText]}>
            {pollQuestion.title}
          </Text>
        )}

        {pollType === HMSPollType.quiz ? (
          <Text
            style={[
              styles.smallerText,
              hmsRoomStyles.regularMediumText,
              { marginTop: 4 },
            ]}
          >
            {pollQuestion.pointWeightage}{' '}
            {parseInt(pollQuestion.pointWeightage) <= 1 ? 'point' : 'points'}
          </Text>
        ) : null}

        {questionTypesVisible && pollQuestion.options ? (
          <View style={{ marginTop: 16 }}>
            {pollQuestion.options.map((option, idx) => (
              <Text
                key={idx}
                style={[
                  styles.smallText,
                  { marginBottom: 8 },
                  hmsRoomStyles.regularMediumText,
                ]}
              >
                {option[1]}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={[styles.saveContainer, { marginTop: 16 }]}>
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

  const InputComponent =
    pollType === HMSPollType.quiz
      ? pollQuestion.type === HMSPollQuestionType.singleChoice
        ? RadioInput
        : pollQuestion.type === HMSPollQuestionType.multipleChoice
          ? CheckBoxIcon
          : null
      : null;

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
                  {!InputComponent ? null : (
                    <View style={{ marginRight: 8 }}>
                      <InputComponent
                        selected={option[0]}
                        type={option[0] ? 'checked' : 'unchecked'}
                        onChange={(data) => {
                          onSetPollQuestionCorrectOption(
                            currentQuestionIndex,
                            idx,
                            data === 'checked'
                              ? true
                              : data === 'unchecked'
                                ? false
                                : data
                          );
                        }}
                      />
                    </View>
                  )}

                  <HMSTextInput
                    placeholder={`Option ${idx + 1}`}
                    style={hmsRoomStyles.optionText}
                    value={option[1]}
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

      {/* {[
        {
          id: 'skippable' as const,
          label: 'Allow to skip',
          enabled: pollQuestion.skippable,
        },
        {
          id: 'responseEditable' as const,
          label: 'Allow to vote again',
          enabled: pollQuestion.responseEditable,
        },
      ].map((item) => {
        return (
          <SwitchRow
            key={item.id}
            text={item.label}
            containerStyle={styles.config}
            textStyle={[styles.smallText, hmsRoomStyles.regularMediumText]}
            value={item.enabled}
            onChange={(value) => {
              onQuestionFieldChange(currentQuestionIndex, item.id, value);
            }}
          />
        );
      })} */}

      {pollType === HMSPollType.quiz ? (
        <View
          style={{
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={[styles.smallText, hmsRoomStyles.regularMediumText]}>
            Point Weightage
          </Text>

          <HMSTextInput
            placeholder=""
            style={[hmsRoomStyles.optionText, { maxWidth: 88, marginLeft: 12 }]}
            value={pollQuestion.pointWeightage}
            autoFocus={false}
            autoCapitalize="none"
            autoCompleteType="off"
            keyboardType={Platform.OS === 'android' ? 'numeric' : 'number-pad'}
            onChangeText={(value) =>
              onQuestionFieldChange(
                currentQuestionIndex,
                'pointWeightage',
                value
              )
            }
          />
        </View>
      ) : null}

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
  smallerText: {
    fontSize: 12,
    lineHeight: 16,
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
    justifyContent: 'space-between',
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
