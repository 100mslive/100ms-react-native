import messages from './message';
import app from './appState';
import {combineReducers} from 'redux';

export default combineReducers({
  messages,
  app,
});
