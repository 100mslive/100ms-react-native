import {createStore} from 'redux';
// import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers/index';

export const store = createStore(rootReducer);
