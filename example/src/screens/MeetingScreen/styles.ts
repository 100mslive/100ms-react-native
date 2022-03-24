import {StyleSheet} from 'react-native';
import dimension from '../../utils/dimension';

import {getThemeColour} from '../../utils/functions';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  videoIcon: {
    color: getThemeColour(),
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    padding: 10,
  },
  raiseHand: {
    color: 'rgb(242,202,73)',
  },
  fullScreenTile: {
    width: '100%',
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    height: '100%',
  },
  fullScreenLandscape: {
    width: '100%',
    marginVertical: 1,
    padding: 0.5,
    overflow: 'hidden',
    borderRadius: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    height: '100%',
  },
  generalTile: {
    height: '100%',
    width: '100%',
    marginVertical: 1,
    padding: '0.25%',
    overflow: 'hidden',
    borderRadius: 10,
  },
  hmsView: {
    height: '100%',
    width: '100%',
  },
  hmsViewScreen: {
    width: '100%',
    height: '100%',
  },
  iconContainers: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: dimension.viewHeight(22),
    paddingTop: dimension.viewHeight(15),
    width: '100%',
    backgroundColor: 'white',
    height: dimension.viewHeight(90),
  },
  leaveIconContainer: {
    backgroundColor: '#ee4578',
    padding: dimension.viewHeight(10),
    borderRadius: 50,
  },
  singleIconContainer: {
    padding: dimension.viewHeight(10),
  },
  leaveIcon: {
    color: 'white',
  },
  wrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  displayContainer: {
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
    backgroundColor: 'rgba(137,139,155,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerName: {
    color: getThemeColour(),
  },
  peerNameContainer: {
    maxWidth: 80,
  },
  micContainer: {
    paddingHorizontal: 3,
  },
  mic: {
    color: getThemeColour(),
  },
  avatarContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  degradedContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'black',
    zIndex: 10,
  },
  avatar: {
    aspectRatio: 1,
    width: '50%',
    maxWidth: dimension.viewWidth(100),
    maxHeight: dimension.viewHeight(100),
    borderRadius: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    color: 'white',
  },
  degradedText: {
    fontSize: 20,
    color: 'white',
  },
  highlight: {
    borderRadius: 10,
    borderWidth: 5,
    borderColor: getThemeColour(),
  },
  messageDot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'red',
    right: dimension.viewWidth(10),
    top: dimension.viewHeight(10),
  },
  options: {
    color: getThemeColour(),
  },
  optionsContainer: {
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  roleChangeText: {
    padding: 12,
  },
  headerName: {
    color: getThemeColour(),
  },
  headerIcon: {
    padding: dimension.viewHeight(10),
  },
  headerContainer: {
    height: dimension.viewHeight(50),
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  page: {
    flexDirection: 'row',
    width: dimension.viewWidth(414),
    flexWrap: 'wrap',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recording: {
    color: 'red',
    padding: dimension.viewHeight(10),
  },
  streaming: {
    color: 'red',
    padding: dimension.viewHeight(10),
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: 'black',
    paddingLeft: 10,
    minHeight: 32,
    color: getThemeColour(),
    margin: 10,
  },
  recordingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  checkboxContainer: {
    height: 25,
    width: 25,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    color: 'black',
  },
  closeButton: {
    zIndex: 2,
    position: 'absolute',
    left: 2,
    top: 0,
    height: 50,
    width: 50,
  },
  flex: {
    flex: 1,
  },
  renderVideo: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brbContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: getThemeColour(),
  },
  brb: {
    color: getThemeColour(),
  },
  brbOnContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: getThemeColour(),
    backgroundColor: getThemeColour(),
  },
  brbOn: {
    color: 'white',
  },
  statsContainer: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 10,
    margin: 1,
  },
  statsText: {
    color: 'white',
    fontSize: 16,
  },
  heroContainer: {
    width: '100%',
    height: '100%',
  },
  heroView: {
    height: '100%',
    width: '100%',
    marginVertical: 1,
    padding: '0.25%',
    overflow: 'hidden',
    borderRadius: 10,
  },
  heroTileContainer: {
    height: '80%',
    width: '100%',
    marginVertical: 1,
    padding: '0.25%',
    overflow: 'hidden',
    borderRadius: 10,
  },
  heroListContainer: {
    width: '100%',
    height: '20%',
  },
  heroListView: {
    width: 150,
    height: '100%',
  },
  heroListViewContainer: {
    marginHorizontal: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  screenshot: {
    backgroundColor: 'white',
    flex: 1,
  },
});

export {styles};
