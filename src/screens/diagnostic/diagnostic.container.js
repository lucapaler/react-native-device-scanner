import React, { useEffect, useState } from 'react';
import { Text, ScrollView } from 'react-native';
import { PropTypes } from 'prop-types';
import { Layout } from '@ui-kitten/components';
import { useSelector } from 'react-redux';

import { logout } from '../../lib/firebase/helpers';

Login.propTypes = {
  navigation: PropTypes.shape({
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};

export default function Login({ navigation }) {
  const [forceUpdate, setForceUpdate] = useState(false);
  // const [logs, setLogs] = useState([]);
  const logs = useSelector(({ discovery }) => discovery.logs);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
  //     setForceUpdate(!forceUpdate);
  //     setLogs(console.logs);
  //   });

  //   return unsubscribe;
  // }, [navigation, forceUpdate]);

  const handleLogin = async () => {
    try {
      await logout();
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        console.log('Enable anonymous in your firebase console.');
      }

      console.error(error);
    }
  };

  return (
    <Layout level="2">
      <ScrollView>
        {/* <Button onPress={handleLogin}>LogOut</Button> */}
        <Text>Version 0.0.2</Text>
        {logs.map((msg) => (
          <Text>
            {String(msg)}
          </Text>
        ))}
      </ScrollView>
    </Layout>
  );
}
