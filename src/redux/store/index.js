import { createStore, compose, applyMiddleware } from 'redux';
import { persistStore, persistCombineReducers } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createSagaMiddleware from 'redux-saga';
// import { createLogger } from 'redux-logger';
import rootReducers from '../reducers'; // where reducers is a object of reducers
import sagas from '../sagas';

const config = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['loadingReducer'],
  // debug: true, //to get useful logging
};

const middleware = [];
const sagaMiddleware = createSagaMiddleware();

middleware.push(sagaMiddleware);

// if (__DEV__) {
//   middleware.push(createLogger());
// }

const appReducers = persistCombineReducers(config, rootReducers);

const rootReducer = (state, action) => {
  return appReducers(state, action)
}

const enhancers = [applyMiddleware(...middleware)];
const persistConfig = { enhancers };
export const store = createStore(rootReducer, undefined, compose(...enhancers));
const persistor = persistStore(store, persistConfig, () => {
  //   console.log('Test', store.getState());
});
const configureStore = () => {
  return { persistor, store };
};

sagaMiddleware.run(sagas);

export default configureStore;

