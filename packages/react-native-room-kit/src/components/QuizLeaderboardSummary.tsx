import * as React from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { useHMSRoomStyleSheet } from '../hooks-util';

export interface QuizLeaderboardSummaryProps {
  data: { label: string; value: any }[][];
}

export const QuizLeaderboardSummary: React.FC<QuizLeaderboardSummaryProps> = ({
  data,
}) => {
  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    regularHighText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-Regular`,
    },
    regularMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-Regular`,
    },
    semiBoldMediumText: {
      color: theme.palette.on_surface_medium,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    semiBoldHighText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    headerText: {
      color: theme.palette.on_surface_high,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    container: {
      backgroundColor: theme.palette.surface_dim,
    },
    summaryContainer: {
      backgroundColor: theme.palette.surface_default,
    },
    entriesCard: {
      backgroundColor: theme.palette.surface_default,
    },
    divider: {
      backgroundColor: theme.palette.border_bright,
    },
  }));

  return (
    <View style={{}}>
      <Text
        style={[
          styles.normalText,
          styles.marginBottom16,
          hmsRoomStyles.semiBoldHighText,
        ]}
      >
        Participation Summary
      </Text>

      <View style={styles.marginBottom16}>
        {data.map((summaryMap, index) => (
          <View key={index} style={{ marginBottom: 8, flexDirection: 'row' }}>
            {summaryMap.map((summary, index) => (
              <React.Fragment key={summary.label}>
                {index > 0 ? <View style={{ width: 8 }} /> : null}

                <View
                  style={[
                    styles.summaryWrapper,
                    hmsRoomStyles.summaryContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.tinyText,
                      styles.marginBottom8,
                      hmsRoomStyles.semiBoldMediumText,
                    ]}
                  >
                    {summary.label}
                  </Text>

                  <Text
                    style={[styles.normalText, hmsRoomStyles.semiBoldHighText]}
                  >
                    {summary.value}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  marginBottom8: {
    marginBottom: 8,
  },
  marginBottom16: {
    marginBottom: 16,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  summaryWrapper: {
    flexBasis: '50%',
    flexGrow: 1,
    flexShrink: 1,
    padding: 16,
    borderRadius: 12,
  },
  position: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 12,
  },
  firstPosition: {
    backgroundColor: '#D69516', // '#FFD700'
  },
  secondPosition: {
    backgroundColor: '#3E3E3E', // '#C0C0C0'
  },
  thirdPosition: {
    backgroundColor: '#583B0F', // '#CD7F32'
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
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
  divider: { height: 1, width: '100%' },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leaderboardEntry: { marginBottom: 16, marginHorizontal: 16 },
  entriesCard: { paddingTop: 12, borderRadius: 8 },
});
