import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';

import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { getMacAddress } from 'react-native-device-info';

import MainBottomTab from './app/tabs';
import { navigationRef } from './NavigationService';
import screens from '../screens';
import { fetchProfile, createProfile, updateProfile } from '../redux/actions/profile';

const Stack = createStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const existingToken = useSelector(({ profile }) => profile.token);
  const pid = useSelector(({ profile }) => profile.pid);
  const profile = useSelector(({ profile }) => profile);
  const profileError = useSelector(({ profile }) => profile.error);

  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(onAuthStateChanged);
    const unsubscribeMessaging = messaging().onTokenRefresh(onMessagingTokenRefresh);

    auth().signInAnonymously()
      .then(async () => {
        dispatch(fetchProfile(await getMacAddress()));
      })
      .catch((error) => {
        Alert.alert('Fatal Error', `Couldn't sign in. ${error.message}`);
      });

    return () => {
      unsubscribeAuth();
      unsubscribeMessaging();
    };
  }, []);

  useEffect(() => {
    if (profileError?.status === 404) { // profile does not exist yet
      getMacAddress()
        .then((mac) => {
          dispatch(createProfile(mac.toLowerCase()));
        });
    }
  }, [profileError]);

  useEffect(() => {
    if (pid) { // just created profile or logged in for first time on this device
      messaging().getToken()
        .then((token) => {
          if (token !== existingToken) dispatch(updateProfile(pid, token));
        });
    }
  }, [pid]);

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  async function onMessagingTokenRefresh(token) {
    updateProfile(pid, token);

    if (initializing) setInitializing(false);
  }

  if (initializing) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      {user
        ? <MainBottomTab />
        : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={screens.General.Login} />
          </Stack.Navigator>
        )}
    </NavigationContainer>
  );
}
