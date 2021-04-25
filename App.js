import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { store, persistor } from './src/redux/store';
import Navigator from './src/navigation';

export default function App() {
  return (
    <Provider store={store}>
      <IconRegistry icons={[EvaIconsPack]} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <PersistGate persistor={persistor}>
          <Navigator />
        </PersistGate>
      </ApplicationProvider>
    </Provider>
  );
}
