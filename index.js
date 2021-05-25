import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';

import App from './App';
import { store } from './src/redux/store';
import { requestDiscoveryConfig } from './src/redux/actions/discovery';

console.stdlog = console.log.bind(console);
console.logs = [];
console.log = (...msg) => {
  console.logs.push(...msg);
  console.stdlog(...msg);
};

messaging().setBackgroundMessageHandler(async (message) => {
  if (message.data?.payload) {
    const payload = JSON.parse(message.data.payload);

    if (payload.remoteScan) {
      store.dispatch(requestDiscoveryConfig({}, store.dispatch, true));

      // wait for scan to finish before ending background handler
      while (store.getState()?.discovery.scan) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // not sure why this timer works; it possibly isn't actually creating timeouts but the
        // presence of the loop keeps the activity alive
      }
    }
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
