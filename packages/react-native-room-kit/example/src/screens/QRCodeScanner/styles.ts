import { StyleSheet } from 'react-native';

import { COLORS } from '../../utils/theme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  headerContainer: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    position: 'absolute',
    left: 0,
    backgroundColor: COLORS.SURFACE.LIGHT,
    height: 40,
    aspectRatio: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
  },
  headerIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  headerText: {
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  joinWithLink: {
    backgroundColor: COLORS.SECONDARY.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.SECONDARY.DEFAULT,
    borderRadius: 8,
  },
  joinWithLinkIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
    paddingRight: 12,
  },
  joinWithLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
  },
  grow: {
    flex: 1,
  },
});

export { styles };
