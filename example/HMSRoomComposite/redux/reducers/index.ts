import messages from './message';
import app from './appState';
import user from './userState';
import hmsStates from './hmsStates';
import {combineReducers} from 'redux';

export default combineReducers({
  messages,
  app,
  user,
  hmsStates,
});
