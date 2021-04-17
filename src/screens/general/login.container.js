import React from 'react';
import { StyleSheet } from 'react-native'
import auth from '@react-native-firebase/auth'
import messaging from '@react-native-firebase/messaging'
import { Button, Layout } from '@ui-kitten/components'
import { getMacAddress } from 'react-native-device-info';

const Login = ({ navigation, route }) => {

    const handleLogin = async () => {
        try {
            await auth().signInAnonymously()
            const token = await messaging().getToken()
            const macAdd = await getMacAddress()
            // API FOR HANDLING FCM TOKEN
            console.log('######################## T O K E N ######################', token)
            console.log('######################## MAC ADDRESS ######################', macAdd)
        } catch (error) {
            if (error.code === 'auth/operation-not-allowed') {
                console.log('Enable anonymous in your firebase console.');
            }

            console.error(error)
        }
    }

    return (
        <Layout level="2" style={styles.container}>
            <Button onPress={handleLogin} status="basic" style={{ elevation: 3 }}>Login!</Button>
        </Layout>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: '5%'
    },
    inputContainer: {
        marginBottom: '7%'
    },
    sectionContainer: {
        padding: '1.75%',
        width: '90%',
        minHeight: '70%',
    }
});
