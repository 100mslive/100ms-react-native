import messages from './message';
import app from './appState';
import user from './userState';
import hmsStates from './hmsStates';
import chatWindow from './chatWindow';
import { combineReducers } from 'redux';

export default combineReducers({
  messages,
  app,
  user,
  hmsStates,
  chatWindow,
});
