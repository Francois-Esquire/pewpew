import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import rootReducers from './reducers';

export default function configureStore(
  state,
  reducers = {},
  middleware = []) {
  const initialState = state || undefined;
  const rootReducer = combineReducers({ ...reducers, ...rootReducers });
  const enhancers = [applyMiddleware(...middleware)];

  if (process.env.NODE_ENV !== 'production') {
    const enhancements = (
      typeof window === 'object' &&
      // eslint-disable-next-line no-underscore-dangle
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      // eslint-disable-next-line no-underscore-dangle
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose
    )(...enhancers);

    const store = createStore(rootReducer, initialState, enhancements);

    if (module && module.hot) {
      module.hot.accept('./reducers', () => {
        const nextReducers = require('./reducers').default;

        store.replaceReducer(combineReducers({
          ...reducers,
          ...nextReducers,
        }));
      });
    }

    return store;
  }

  return createStore(rootReducer, initialState, compose(...enhancers));
}
