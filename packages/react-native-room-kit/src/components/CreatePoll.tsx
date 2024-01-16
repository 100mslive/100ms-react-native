import * as React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { BottomSheet } from './BottomSheet';
import { HMSTextInput } from './HMSTextInput';
import { HMSPrimaryButton } from './HMSPrimaryButton';
import { COLORS } from '../utils/theme';
import type { RootState } from '../redux';
import { setPollConfig, setPollName, setPollStage } from '../redux/actions';
import { CreatePollStages } from '../redux/actionTypes';
import type { PollConfig } from '../redux/actionTypes';

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
    typeLabelIconContainer: {
      borderColor: theme.palette.border_bright,
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

  const addQuestions = () => {
    if (pollName.trim().length > 0) {
      dispatch(setPollStage(CreatePollStages.POLL_QUESTION_CONFIG));
    }
  };

  return (
    <View style={styles.contentContainer}>
      <Text style={[styles.pollNameLabel, hmsRoomStyles.pollNameLabel]}>
        Poll Name
      </Text>

      <HMSTextInput
        style={styles.textInput}
        value={pollName}
        autoFocus={false}
        onChangeText={handlePollNameChange}
      />

      <BottomSheet.Divider style={{ marginVertical: 24 }} />

      <Text style={[styles.pollNameLabel, hmsRoomStyles.pollNameLabel]}>
        Settings
      </Text>

      {[
        {
          id: 'voteCountHidden' as const,
          label: 'Hide vote count',
          enabled: pollConfig.voteCountHidden,
        },
        {
          id: 'resultsAnonymous' as const,
          label: 'Make results anonymous',
          enabled: pollConfig.resultsAnonymous,
        },
      ].map((item) => {
        return (
          <View key={item.id} style={{ marginTop: 16, flexDirection: 'row' }}>
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
        title="Add Questions"
        onPress={addQuestions}
        loading={false}
        style={{ marginTop: 24 }}
      />
    </View>
  );
};

// {/* <Text style={[styles.typeSelectionLabel, hmsRoomStyles.typeSelectionLabel]}>
//   Select the type you want to continue with
// </Text>
// <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 24, }}>
//   {[
//     {
//       id: 'poll',
//       label: 'Poll',
//       icon: <PollIcon />,
//       pressHandler: undefined,
//       active: true,
//     },
//     {
//       id: 'quiz',
//       label: 'Quiz',
//       icon: <QuizIcon />,
//       pressHandler: undefined,
//       active: false,
//     },
//   ].map((item, idx) => {
//     const isFirst = idx === 0;
//     const isActive = item.active;
//     return (
//       <React.Fragment key={item.id}>
//         {isFirst ? null : <View style={{ width: 16 }} />}

//         <View style={{ flexGrow: 1 }}>
//           <TouchableOpacity
//             onPress={item.pressHandler}
//             style={[{ flexDirection: 'row', padding: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center', }, hmsRoomStyles.typeLabelContainer]}
//           >
//             <View style={[{ padding: 8, borderRadius: 4, borderWidth: 1, marginRight: 16 }, hmsRoomStyles.typeLabelIconContainer]}>{item.icon}</View>
//             <Text style={[{ fontSize: 16, lineHeight: 24, letterSpacing: 0.15 }, hmsRoomStyles.typeLabel]}>{item.label}</Text>
//           </TouchableOpacity>
//         </View>
//       </React.Fragment>
//     )
//   })}
// </View> */}

const styles = StyleSheet.create({
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
