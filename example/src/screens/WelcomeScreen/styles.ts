import {StyleSheet, Platform} from 'react-native';

import {COLORS, FONTS} from '../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    color: COLORS.PRIMARY.DEFAULT,
    ...FONTS.H2,
  },
  image: {
    width: 60,
    height: 60,
  },
  heading: {
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    ...FONTS.H6,
    color: COLORS.PRIMARY.DEFAULT,
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    paddingLeft: 10,
    minHeight: 32,
    fontFamily: 'Inter-Regular',
    color: COLORS.PRIMARY.DEFAULT,
    paddingRight: 40,
  },
  joinButtonContainer: {
    padding: 12,
    marginTop: 20,
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    color: COLORS.WHITE,
    marginRight: 8,
  },
  joinButtonText: {
    textAlign: 'center',
    color: COLORS.WHITE,
    ...FONTS.H6,
    paddingRight: 8,
  },
  settingsIcon: {
    color: COLORS.PRIMARY.DEFAULT,
  },
  settingsIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 10,
  },
  appVersion: {
    alignSelf: 'center',
    paddingTop: 10,
    fontSize: 20,
    color: COLORS.PRIMARY.DEFAULT,
  },
  clear: {
    position: 'absolute',
    right: 5,
    height: '100%',
    justifyContent: 'center',
  },
  halfOpacity: {
    opacity: 0.5,
  },
  fullOpacity: {
    opacity: 1,
  },
});

export {styles};
