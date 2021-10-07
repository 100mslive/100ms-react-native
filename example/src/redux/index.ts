import {createStore} from 'redux';
// import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers/index';

export const store = createStore(rootReducer);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
