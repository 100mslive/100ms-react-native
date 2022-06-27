import {StyleSheet} from 'react-native';

import {COLORS} from '../../utils/theme';

const styles = StyleSheet.create({
  contentContainerStyle: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  image: {
    height: 234,
    width: 304,
  },
  heading: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Medium',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0.25,
    textAlign: 'center',
    paddingTop: 24,
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
    paddingHorizontal: 28,
  },
  joiningLinkInput: {
    backgroundColor: COLORS.SURFACE.LIGHT,
    borderColor: COLORS.BORDER.LIGHT,
    borderWidth: 1,
    width: '100%',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Medium',
  },
  joiningLinkInputText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  joiningLinkInputView: {
    marginTop: 56,
  },
  joinButton: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY.DEFAULT,
    marginTop: 16,
    borderRadius: 8,
  },
  disabled: {
    backgroundColor: COLORS.SECONDARY.DISABLED,
    borderColor: COLORS.SECONDARY.DISABLED,
  },
  joinButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
  },
  disabledText: {
    color: COLORS.TEXT.DISABLED_ACCENT,
  },
  horizontalSeparator: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.SECONDARY.DISABLED,
    marginVertical: 24,
  },
  scanQRButton: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY.DEFAULT,
    borderRadius: 8,
  },
  scanQRButtonIcon: {
    color: COLORS.TEXT.HIGH_EMPHASIS_ACCENT,
    paddingRight: 12,
  },
});

export {styles};
