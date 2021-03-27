import React from 'react';
import { View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack';
import { Icon, Layout, TopNavigation, TopNavigationAction, Text } from '@ui-kitten/components';

// Screens
import screens from '../../screens'

const Stack = createStackNavigator();

const BackIcon = (props) => (
    <Icon {...props} name='arrow-back' />
);

const HeaderTitle = ({ title, ...rest }) => (
    <View style={{

        justifyContent: 'center',

    }}>
        <Text {...rest} category="h6" style={{
            textAlign: 'center',
            fontWeight: 'bold'
        }}>{title}</Text>
    </View>
);



const TopNavigationAccessoriesShowcase = ({ title, navigation, previous }) => {

    const renderBackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
    );

    return (
        <Layout level='1'>
            <TopNavigation
                alignment='center'
                title={(props) => <HeaderTitle {...props} title={title} />}
                // subtitle='Subtitle'
                accessoryLeft={previous ? renderBackAction : null}
            />
        </Layout>
    );
};



export function DiscoveryStack({ navigation }) {
    return (
        <Stack.Navigator  screenOptions={{
            header: ({ scene, previous, navigation }) => {
                const { options } = scene.descriptor;
                const title =
                    options.headerTitle !== undefined
                        ? options.headerTitle
                        : options.title !== undefined
                            ? options.title
                            : scene.route.name;

                return (
                    <TopNavigationAccessoriesShowcase title={title} navigation={navigation} previous={previous} />

                );
            }
        }}>
            <Stack.Screen name="Discovery" component={screens.Discovery} />
            <Stack.Screen 
                name="DeviceDetails" 
                component={screens.DeviceInfo} 
                options={{
                    headerTitle: 'Device Details'
                }} 
            />
            <Stack.Screen 
                name="ScanLogs" 
                component={screens.ScanLogs} 
                options={{
                    headerTitle: 'Scan Logs'
                }} 
            />
        </Stack.Navigator>
    );
}