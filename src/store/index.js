import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import rootReducers from './reducers';

export default function configureStore(
  state,
  reducers = {},
  middleware = []) {
  let composer;

  if (process.env.NODE_ENV !== 'production') {
    composer = typeof window === 'object' &&
    // eslint-disable-next-line no-underscore-dangle
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      // eslint-disable-next-line no-underscore-dangle
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
  } else composer = compose;

  const initialState = state || undefined;

  const rootReducer = combineReducers({ ...reducers, ...rootReducers });

  const enhancements = composer(applyMiddleware(...middleware));

  return createStore(rootReducer, initialState, enhancements);
}
