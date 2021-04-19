import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth'
import messaging from '@react-native-firebase/messaging'
import MainBottomTab from './app/tabs'
import { navigationRef } from './NavigationService';
import { updateUserProfile } from '../api/methods/account'

// Screens
import screens from '../screens'

const Stack = createStackNavigator();

function App() {

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  async function onMessagingTokenRefresh(token) {
    console.log('######################## T O K E N ######################', token)
    const updateUserInfoResp = await updateUserProfile(token)
    console.log(updateUserInfoResp.data)
    if(updateUserInfoResp.error){
      console.log('[MESSAGING TOKEN REFRESH]', error)
    }

    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const UserSubscriber = auth().onAuthStateChanged(onAuthStateChanged);
    const MessagingSubscriber = messaging().onTokenRefresh(onMessagingTokenRefresh);
    return () => { UserSubscriber(); MessagingSubscriber(); }; // unsubscribe on unmount
  }, []);

  // useEffect(() => {
  //   const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
  //   return subscriber; // unsubscribe on unmount
  // }, []);

  if (initializing) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      {
        user
          ? <MainBottomTab />
          : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={screens.General.Login} />
            </Stack.Navigator>
          )
      }
    </NavigationContainer>

  );
}

export default App;