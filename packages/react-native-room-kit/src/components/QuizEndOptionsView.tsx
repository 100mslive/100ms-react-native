import * as React from 'react';
import type { HMSPollQuestionOption } from '@100mslive/react-native-hms';
import { StyleSheet, Text, View } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';
import { CheckIcon } from '../Icons';

interface QuizEndOptionsViewProps {
  option: HMSPollQuestionOption;
  isSelected: boolean;
  isCorrect: boolean;
}

export const QuizEndOptionsView: React.FC<QuizEndOptionsViewProps> = ({
  option,
  isSelected,
  isCorrect,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    surfaceHighRegularText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    surfaceMediumRegularText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        {isCorrect ? <CheckIcon style={styles.icon} type="in-circle" /> : null}

        <Text style={[styles.smallText, hmsRoomStyles.surfaceHighRegularText]}>
          {option.text}
        </Text>
      </View>

      {isSelected ? (
        <Text
          style={[styles.smallText, hmsRoomStyles.surfaceMediumRegularText]}
        >
          Your Answer
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
