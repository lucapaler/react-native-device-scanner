import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainBottomTab from './app/tabs'
import { navigationRef } from './NavigationService';

function App() {

  return (
    <NavigationContainer ref={navigationRef}>
        <MainBottomTab />
    </NavigationContainer>

  );
}

export default App;