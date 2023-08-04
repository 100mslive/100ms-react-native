import { createStore } from 'redux';

import rootReducer from './reducers/index';

export const store = createStore(rootReducer);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
