import * as React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { HMSPollType } from '@100mslive/react-native-hms';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { BottomSheet } from './BottomSheet';
import { HMSTextInput } from './HMSTextInput';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import {
  pushToNavigationStack,
  setPollConfig,
  setPollName,
} from '../redux/actions';
import { CreatePollStages } from '../redux/actionTypes';
import type { PollConfig } from '../redux/actionTypes';
import { PollIcon, QuizIcon } from '../Icons';

export interface CreatePollProps {}

export const CreatePoll: React.FC<CreatePollProps> = ({}) => {
  const dispatch = useDispatch();
  const pollName = useSelector((state: RootState) => state.polls.pollName);
  const pollConfig = useSelector((state: RootState) => state.polls.pollConfig);

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    typeSelectionLabel: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    typeLabel: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    typeLabelContainer: {
      borderColor: theme.palette.border_bright,
    },
    activeTypeLabelContainer: {
      borderColor: theme.palette.primary_default,
    },
    typeLabelIconContainer: {
      borderColor: theme.palette.border_bright,
      backgroundColor: theme.palette.surface_bright,
    },
    activeTypeLabelIconContainer: {
      borderColor: theme.palette.primary_default,
      backgroundColor: theme.palette.surface_bright,
    },
    pollNameLabel: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  const handlePollNameChange = (name: string) => {
    dispatch(setPollName(name));
  };

  const handleConfigChange = (
    configKey: keyof PollConfig,
    configValue: boolean
  ) => {
    dispatch(setPollConfig({ [configKey]: configValue }));
  };

  const handlePollTypeChange = (configValue: PollConfig['type']) => {
    dispatch(setPollConfig({ type: configValue }));
  };

  const addQuestions = () => {
    if (pollName.trim().length > 0) {
      dispatch(pushToNavigationStack(CreatePollStages.POLL_QUESTION_CONFIG));
    }
  };

  return (
    <View style={styles.contentContainer}>
      <Text
        style={[styles.typeSelectionLabel, hmsRoomStyles.typeSelectionLabel]}
      >
        Select the type you want to continue with
      </Text>

      <View style={styles.typeContainer}>
        {[
          {
            id: 'poll',
            label: 'Poll',
            icon: <PollIcon />,
            pressHandler: () => handlePollTypeChange(HMSPollType.poll),
            active: pollConfig.type === HMSPollType.poll,
          },
          {
            id: 'quiz',
            label: 'Quiz',
            icon: <QuizIcon />,
            pressHandler: () => handlePollTypeChange(HMSPollType.quiz),
            active: pollConfig.type === HMSPollType.quiz,
          },
        ].map((item, idx) => {
          const isFirst = idx === 0;
          const isActive = item.active;
          return (
            <React.Fragment key={item.id}>
              {isFirst ? null : <View style={{ width: 16 }} />}

              <View style={{ flexGrow: 1 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={isActive}
                  onPress={item.pressHandler}
                  style={[
                    styles.typeLabelContainer,
                    isActive
                      ? hmsRoomStyles.activeTypeLabelContainer
                      : hmsRoomStyles.typeLabelContainer,
                  ]}
                >
                  <View
                    style={[
                      styles.typeLabelIconContainer,
                      isActive
                        ? hmsRoomStyles.activeTypeLabelIconContainer
                        : hmsRoomStyles.typeLabelIconContainer,
                    ]}
                  >
                    {item.icon}
                  </View>
                  <Text style={[styles.typeLabel, hmsRoomStyles.typeLabel]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      <Text style={[styles.pollNameLabel, hmsRoomStyles.pollNameLabel]}>
        {pollConfig.type === HMSPollType.quiz ? 'Quiz' : 'Poll'} Name
      </Text>

      <HMSTextInput
        style={styles.textInput}
        value={pollName}
        autoFocus={false}
        onChangeText={handlePollNameChange}
        placeholder={`My ${pollConfig.type === HMSPollType.quiz ? 'Quiz' : 'Poll'}`}
      />

      <BottomSheet.Divider style={{ marginVertical: 24 }} />

      {[
        {
          id: 'voteCountHidden' as const,
          label: 'Hide vote count',
          enabled: pollConfig.voteCountHidden,
          visible: pollConfig.type === HMSPollType.poll,
        },
        // {
        //   id: 'resultsAnonymous' as const,
        //   label: 'Make results anonymous',
        //   enabled: pollConfig.resultsAnonymous,
        //   visible: true
        // },
      ]
        .filter((item) => item.visible)
        .map((item) => {
          return (
            <View key={item.id} style={styles.switchWrapper}>
              <Text
                style={[
                  styles.pollNameLabel,
                  hmsRoomStyles.typeSelectionLabel,
                  { flexGrow: 1 },
                ]}
              >
                {item.label}
              </Text>

              <Switch
                value={item.enabled}
                thumbColor={COLORS.WHITE}
                trackColor={{
                  true: COLORS.PRIMARY.DEFAULT,
                  false: COLORS.SECONDARY.DISABLED,
                }}
                onValueChange={(value) => handleConfigChange(item.id, value)}
              />
            </View>
          );
        })}

      <HMSPrimaryButton
        disabled={!pollName.trim()}
        title={`Create ${pollConfig.type === HMSPollType.quiz ? 'Quiz' : 'Poll'}`}
        onPress={addQuestions}
        loading={false}
        style={styles.createPollBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  typeContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 24,
  },
  typeLabelContainer: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeLabelIconContainer: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 16,
  },
  typeLabel: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  switchWrapper: {
    marginTop: 4,
    flexDirection: 'row',
  },
  createPollBtn: {
    marginTop: 24,
    marginBottom: 16,
  },
  contentContainer: {
    marginHorizontal: 24,
  },
  typeSelectionLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  pollNameLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  textInput: {
    flex: undefined,
    marginTop: 8,
  },
});
