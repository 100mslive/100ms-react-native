import {StyleSheet} from 'react-native';

import {COLORS} from '../../utils/theme';

const styles = StyleSheet.create({
  contentContainerStyle: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  image: {
    height: 80,
    width: 80,
  },
  heading: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Medium',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0.25,
    textAlign: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  description: {
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingTop: 16,
  },
  userNameInput: {
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderColor: COLORS.BORDER.LIGHT,
    borderWidth: 1,
    width: '100%',
    borderRadius: 8,
    paddingVertical: 12,
    paddingLeft: 16,
    marginTop: 8,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Medium',
  },
  userNameInputText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  userNameInputView: {
    marginTop: 40,
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY.DEFAULT,
    marginTop: 40,
    borderRadius: 8,
    width: '50%',
  },
  disabled: {
    backgroundColor: COLORS.SECONDARY.DISABLED,
    borderColor: COLORS.SECONDARY.DISABLED,
  },
  startButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
  },
  disabledText: {
    color: COLORS.TEXT.DISABLED_ACCENT,
  },
  flex: {
    flex: 1,
  },
  settingsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  settingsButton: {
    marginRight: 16,
    marginTop: 16,
    backgroundColor: COLORS.BACKGROUND.DEFAULT,
    borderColor: COLORS.BORDER.LIGHT,
    borderWidth: 1,
    height: 32,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  settingsIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
  },
  settingsMenuContainer: {
    backgroundColor: COLORS.SURFACE.LIGHT,
  },
  settingsMenuItemName: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
});

export {styles};
