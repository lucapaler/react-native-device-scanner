import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, BottomNavigationTab, BottomNavigation } from '@ui-kitten/components';
import screens from '../../screens'
import { DiscoveryStack } from './stacks'

// Navigators
const BottomTab = createBottomTabNavigator();

const BottomTabBar = ({ navigation, state }) => (
    <BottomNavigation
        appearance='noIndicator'
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}
    >

        <BottomNavigationTab title='Discovery' icon={props => <Icon {...props} name='compass-outline' />} />
        <BottomNavigationTab title='Diagnostic' icon={props => <Icon {...props} name='search-outline' />} />
        <BottomNavigationTab title='Analysis' icon={props => <Icon {...props} name='activity-outline' />} />
    </BottomNavigation>
);

function MainBottomTab({ navigation, route }) {
    return (
        <BottomTab.Navigator initialRouteName="Discovery" tabBar={props => <BottomTabBar {...props} />} >
            <BottomTab.Screen name="DiscoveryTab" component={DiscoveryStack} />
            <BottomTab.Screen name="Diagnostic" component={screens.Diagnostic} />
            <BottomTab.Screen name="Analysis" component={screens.Analysis} />
        </BottomTab.Navigator>
    );
}


export default MainBottomTab;
