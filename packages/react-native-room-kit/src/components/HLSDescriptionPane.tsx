import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';

import {
  useHLSViewsConstraints,
  useHMSConferencingScreenConfig,
  useHMSRoomStyleSheet,
} from '../hooks-util';
import { HLSChatHeaderView } from './HLSChatHeaderView';
import {
  HLSDescriptionPaneHeader,
  HLSDescriptionPaneHeaderHeight,
} from './HLSDescriptionPaneHeader';
import { HLSAnimatedDescriptionPane } from './HLSAnimatedDescriptionPane';
import { setHlsDescriptionPaneVisible } from '../redux/actions';
import type { RootState } from '../redux';
import { splitLinksAndContent } from '../utils/functions';

interface HLSDescriptionPaneProps {}

export const HLSDescriptionPane: React.FC<HLSDescriptionPaneProps> = () => {
  const dispatch = useDispatch();
  const paneVisible = useSelector(
    (state: RootState) => state.app.hlsDescriptionPaneVisible
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    wrapper: {
      backgroundColor: theme.palette.surface_dim,
    },
    regularSurfaceMedium: {
      fontFamily: `${typography.font_family}-Regular`,
      color: theme.palette.on_surface_medium,
    },
    link: {
      color: theme.palette.primary_bright,
    },
  }));

  const { descriptionPaneConstraints } = useHLSViewsConstraints();

  const descriptionPaneContentHeight =
    descriptionPaneConstraints.height - HLSDescriptionPaneHeaderHeight;

  const desPaneTranslationValue = useSharedValue(0);

  const _closeDescriptionPane = () => {
    dispatch(setHlsDescriptionPaneVisible(false));
  };

  const hideDescriptionPane = () => {
    if (paneVisible) {
      desPaneTranslationValue.value = withTiming(0, { duration: 280 }, () => {
        runOnJS(_closeDescriptionPane)();
      });
    }
  };

  React.useEffect(() => {
    if (!paneVisible) {
      return;
    }
    desPaneTranslationValue.value = withTiming(1, { duration: 280 });
    return () => {
      cancelAnimationFrame(desPaneTranslationValue.value);
    };
  }, [paneVisible]);

  const description = useHMSConferencingScreenConfig((confScreenConfig) => {
    return confScreenConfig?.elements?.header?.description;
  });

  const handleLinkPress = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  if (!paneVisible) {
    return null;
  }

  // TODO: for links to work, add query in manifest.xml

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        width: descriptionPaneConstraints.width,
        height: descriptionPaneConstraints.height,
        zIndex: 10,
      }}
    >
      <HLSDescriptionPaneHeader
        close={hideDescriptionPane}
        animatedValue={desPaneTranslationValue}
      />

      <View style={{ flex: 1, overflow: 'hidden' }}>
        <HLSAnimatedDescriptionPane
          height={descriptionPaneContentHeight}
          sharedValue={desPaneTranslationValue}
        >
          <ScrollView
            style={hmsRoomStyles.wrapper}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <HLSChatHeaderView expanded={true} />

            {description ? (
              <Text
                style={[styles.description, hmsRoomStyles.regularSurfaceMedium]}
              >
                {splitLinksAndContent(description, {
                  pressHandler: handleLinkPress,
                  style: hmsRoomStyles.link,
                })}
              </Text>
            ) : null}
          </ScrollView>
        </HLSAnimatedDescriptionPane>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 16,
  },
});
