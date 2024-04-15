import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { CompanyLogo } from './CompanyLogo';
import {
  useHMSConferencingScreenConfig,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import type { RootState } from '../redux';
import { HLSRecordingStatusText } from './HLSRecordingStatusText';
import { useIsHLSStreamingOn } from '../hooks-sdk';
import { HLSStreamStartedTime } from './HLSStreamStartedTime';
import { setHlsDescriptionPaneVisible } from '../redux/actions';

export interface HLSChatHeaderViewProps {
  expanded?: boolean;
}

export const _HLSChatHeaderView: React.FC<HLSChatHeaderViewProps> = ({
  expanded = false,
}) => {
  const dispatch = useDispatch();
  const isHLSStreaming = useIsHLSStreamingOn();

  const peerCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );
  const headerTitle = useHMSConferencingScreenConfig((confScreenConfig) => {
    return confScreenConfig?.elements?.header?.title;
  });
  const isValidHeaderDescription = useHMSConferencingScreenConfig(
    (confScreenConfig) => {
      return !!confScreenConfig?.elements?.header?.description;
    }
  );

  const showDescriptionPane = () => {
    dispatch(setHlsDescriptionPaneVisible(true));
  };

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    container: {
      backgroundColor: theme.palette.surface_dim,
      borderBottomColor: theme.palette.border_bright,
    },
    semiBoldSecondaryHigh: {
      fontFamily: `${typography.font_family}-SemiBold`,
      color: theme.palette.on_secondary_high,
    },
    semiBoldSurfaceHigh: {
      fontFamily: `${typography.font_family}-SemiBold`,
      color: theme.palette.on_surface_high,
    },
    regularSurfaceMedium: {
      fontFamily: `${typography.font_family}-Regular`,
      color: theme.palette.on_surface_medium,
    },
    regularSurfaceLow: {
      fontFamily: `${typography.font_family}-Regular`,
      color: theme.palette.on_surface_low,
    },
  }));

  return (
    <View
      style={[
        styles.container,
        hmsRoomStyles.container,
        expanded ? { borderBottomWidth: 0 } : null,
      ]}
    >
      <CompanyLogo style={styles.logo} />

      <View style={{ flexShrink: 1 }}>
        {headerTitle ? (
          <Text
            numberOfLines={expanded ? undefined : 2}
            style={[styles.title, hmsRoomStyles.semiBoldSecondaryHigh]}
          >
            {headerTitle}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.subtitle, hmsRoomStyles.regularSurfaceMedium]}>
            {peerCount} {isHLSStreaming ? 'watching' : 'joined'}
          </Text>

          {isHLSStreaming ? (
            <HLSStreamStartedTime
              prefix={
                <Text
                  style={[
                    styles.subtitleDivider,
                    hmsRoomStyles.regularSurfaceLow,
                  ]}
                >
                  ●
                </Text>
              }
            />
          ) : null}

          {isValidHeaderDescription && !expanded ? (
            <Pressable
              onPress={showDescriptionPane}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[
                  styles.subtitle,
                  { marginLeft: 8 },
                  hmsRoomStyles.semiBoldSurfaceHigh,
                ]}
              >
                ...more
              </Text>
            </Pressable>
          ) : (
            <HLSRecordingStatusText
              style={[styles.subtitle, hmsRoomStyles.regularSurfaceMedium]}
              prefix={
                <Text
                  style={[
                    styles.subtitleDivider,
                    hmsRoomStyles.regularSurfaceLow,
                  ]}
                >
                  ●
                </Text>
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

export const HLSChatHeaderView = React.memo(_HLSChatHeaderView);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  logo: { marginRight: 12 },
  title: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  subtitleDivider: {
    fontSize: 6,
    lineHeight: 16,
    marginHorizontal: 8,
  },
});
