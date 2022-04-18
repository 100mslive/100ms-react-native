import {StyleSheet, Platform} from 'react-native';

import {getThemeColour} from '../../utils/functions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontWeight: '700',
    color: getThemeColour(),
    fontSize: 44,
  },
  image: {
    width: 60,
    height: 60,
  },
  heading: {
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 20,
    fontWeight: '500',
    color: getThemeColour(),
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    paddingLeft: 10,
    minHeight: 32,
    color: getThemeColour(),
    paddingRight: 40,
  },
  joinButtonContainer: {
    padding: 12,
    marginTop: 20,
    backgroundColor: getThemeColour(),
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    color: 'white',
    marginRight: 8,
  },
  joinButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    paddingRight: 8,
  },
  settingsIcon: {
    color: getThemeColour(),
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
    color: getThemeColour(),
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
