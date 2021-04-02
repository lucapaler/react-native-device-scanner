/**
 * React Native App
 * Everthing starts from the entrypoint
 */
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry, useTheme } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import auth from '@react-native-firebase/auth';
import configureStore from './redux/store';
import Navigator from './navigation';

//  import { FontAwesomeIconsPack } from './Icons/fontAwesome';
//  import { EntypoIconsPack } from './Icons/entypo';

const { persistor, store } = configureStore();

export default function Entrypoint() {
    const theme = useTheme();

    useEffect(() => {
        auth().signInAnonymously()
            .then(() => {
                console.log('User signed in anonymously');
            });
    }, []);

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
