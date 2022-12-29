import app from './appState';
import user from './userState';
import {combineReducers} from 'redux';

export default combineReducers({
  app,
  user,
});
