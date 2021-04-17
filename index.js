import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging'
import App from './App';
import configureStore from './src/redux/store'
import * as actions from './src/redux/actions/discovery'

const { store } = configureStore()

// import App from './App copy';

messaging().setBackgroundMessageHandler(async (message) => {
    if (message.data && message.data.payload) {
        const payload = JSON.parse(message.data.payload);

        if (payload.remoteScan) {
            store.dispatch(actions.startDiscovery(store.dispatch));

            // wait for scan to finish before ending background handler
            while (store.getState()?.discoveryReducer?.scan) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }
});



// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
