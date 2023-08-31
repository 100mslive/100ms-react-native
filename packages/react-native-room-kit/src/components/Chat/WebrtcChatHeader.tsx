import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { CloseIcon } from '../../Icons';
import { useHMSRoomStyleSheet } from '../../hooks-util';
import type { RootState } from '../../redux';
import { COLORS } from '../../utils/theme';
import { ChatBottomSheetTabs } from '../../utils/types';
import { setActiveChatBottomSheetTab } from '../../redux/actions';

interface WebrtcChatHeaderProps {
  onClosePress?: () => void;
}

const _WebrtcChatHeader: React.FC<WebrtcChatHeaderProps> = ({
  onClosePress,
}) => {
  const dispatch = useDispatch();
  const peersCount = useSelector(
    (state: RootState) => state.hmsStates.room?.peerCount
  );
  const activeChatBottomSheetTab = useSelector(
    (state: RootState) => state.app.activeChatBottomSheetTab
  );

  const hmsRoomStyles = useHMSRoomStyleSheet((theme, typography) => ({
    tab: {
      backgroundColor: theme.palette.surface_bright,
    },
    headerTitle: {
      color: theme.palette.on_surface_low,
      fontFamily: `${typography.font_family}-SemiBold`,
    },
    activeHeaderTitle: {
      color: theme.palette.on_surface_high,
    },
  }));

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleWrapper}>
        {ChatBottomSheetTabs.map((tab) => {
          const isActive = activeChatBottomSheetTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive ? hmsRoomStyles.tab : null]}
              onPress={() => dispatch(setActiveChatBottomSheetTab(tab))}
            >
              <Text
                style={[
                  styles.headerTitle,
                  hmsRoomStyles.headerTitle,
                  isActive ? hmsRoomStyles.activeHeaderTitle : null,
                ]}
              >
                {tab}
                {tab === 'Participants' && typeof peersCount === 'number'
                  ? ` (${peersCount})`
                  : null}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity onPress={onClosePress}>
        <CloseIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleWrapper: {
    flex: 1,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    backgroundColor: COLORS.SURFACE.DEFAULT,
    marginRight: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    textAlign: 'center',
  },
});

export const WebrtcChatHeader = React.memo(_WebrtcChatHeader);
