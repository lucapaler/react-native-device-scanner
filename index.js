import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';

import App from './App';
import { store } from './src/redux/store';
import { startDiscovery, requestDiscoveryConfig } from './src/redux/actions/discovery';
import { noReduxScan } from './src/lib/helpers';

messaging().setBackgroundMessageHandler(async (message) => {
  if (message.data?.payload) {
    const payload = JSON.parse(message.data.payload);

    if (payload.remoteScan) {
      store.dispatch(requestDiscoveryConfig());

      await new Promise((resolve) => setTimeout(resolve, 3000));

      store.dispatch(startDiscovery(store.dispatch, store.getState().discovery.config, true));

      // wait for scan to finish before ending background handler
      while (store.getState()?.discovery.scan) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
