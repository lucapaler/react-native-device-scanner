import React from 'react';
import { StyleSheet } from 'react-native'
import auth from '@react-native-firebase/auth'
import { Button, Layout } from '@ui-kitten/components'

const Login = ({ navigation, route }) => {

    const handleLogin = async () => {
        try {
            await auth().signInAnonymously()
        } catch (error){
            if (error.code === 'auth/operation-not-allowed') {
                console.log('Enable anonymous in your firebase console.');
            }
          
            console.error(error)
        }
    }

    return (
        <Layout level="2" style={styles.container}>
            <Button onPress={handleLogin} status="basic" style={{elevation: 3}}>Login!</Button>
        </Layout>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding:'5%'
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
