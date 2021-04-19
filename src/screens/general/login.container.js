import React from 'react';
import { StyleSheet } from 'react-native'
import auth from '@react-native-firebase/auth'
import messaging from '@react-native-firebase/messaging'
import { Button, Layout } from '@ui-kitten/components'
import { getUserProfile, updateUserProfile, registerUser } from '../../api/methods/account'

const Login = ({ navigation, route }) => {

    const fetchUserInfo = async (token) => {
        try {
            const userInfoResp = await getUserProfile()

            if(userInfoResp.error && userInfoResp.status === 404) {
                const registerUserResp  = await registerUser()
                if(!registerUserResp.error && registerUserResp.status === 201){
                    console.log('REGISTERED')
                }
            }

            const updateUserInfoResp = await updateUserProfile(token)

            console.log(updateUserInfoResp.data)

            
        } catch (error){
            console.log(error)
        }
    }

    const handleLogin = async () => {
        try {
            await auth().signInAnonymously()
            const token = await messaging().getToken()
            await fetchUserInfo(token)
        } catch (error) {
            if (error.code === 'auth/operation-not-allowed') {
                console.log('Enable anonymous in your firebase console.');
            }

            console.error(error)
        }
    }

    return (
        <Layout level="2" style={styles.container}>
            <Button onPress={handleLogin} status="basic" style={{ elevation: 3 }}>Login / Register!</Button>
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
