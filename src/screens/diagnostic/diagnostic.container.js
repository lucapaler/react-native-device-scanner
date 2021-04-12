import React from 'react';
import { logout } from '../../lib/firebase/helpers'
import { Button, Layout } from '@ui-kitten/components'

const Login = ({ navigation, route }) => {

    const handleLogin = async () => {
        try {
            await logout()
        } catch (error){
            if (error.code === 'auth/operation-not-allowed') {
                console.log('Enable anonymous in your firebase console.');
            }
          
            console.error(error)
        }
    }

    return (
        <Layout level="2">
            <Button onPress={handleLogin}>LogOut</Button>
        </Layout>
    )
}

export default Login