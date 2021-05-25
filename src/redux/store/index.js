import { combineReducers, createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createSagaMiddleware from 'redux-saga';

import { profileReducer, discoveryReducer } from '../reducers';
import sagas from '../sagas';
import logger from './logger';

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['profile', 'discovery'],
};

const profilePersistConfig = {
  key: 'profile',
  storage: AsyncStorage,
  blacklist: ['error'],
};

const discoveryPersistConfig = {
  key: 'discovery',
  storage: AsyncStorage,
  blacklist: ['isScanning', 'logs', 'isReady'],
};

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  profile: persistReducer(profilePersistConfig, profileReducer),
  discovery: persistReducer(discoveryPersistConfig, discoveryReducer),
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = createStore(
  persistedReducer,
  applyMiddleware(sagaMiddleware, logger),
);

const persistor = persistStore(store);

// persistor.purge();

export { store, persistor };

sagaMiddleware.run(sagas);
