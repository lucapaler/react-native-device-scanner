import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View, ScrollView, SafeAreaView, StyleSheet,
} from 'react-native';
import {
  Input, Button, Spinner, useTheme, IndexPath, SelectItem, Select,
} from '@ui-kitten/components';

import Error from '../shared/components/Error';
import { useInputField, useErrorHandler } from '../shared/effects/form';
import { requestDiscoveryConfig } from '../../redux/actions/discovery';

const ConfigForm = ({ navigation, errorHandler }) => {
  const dispatch = useDispatch();
  const DefaultConfiguration = useSelector((state) => state.discovery?.config);
  const [config, setConfig] = useState({});
  const [back, setBack] = useState(false);
  const [zconfServicesIdx, setZConfServicesIdx] = useState([]);

  const timeout = useInputField({
    Field: {
      name: 'Timeout (IP Scan)',
      type: 'numeric',
      value: 1000,
    },
    ErrorHandler: errorHandler,
    Limit: {
      min: 0,
      max: 10000,
    },
  });

  const localIp = useInputField({
    Field: {
      name: 'Local Ip Address',
      type: 'text',
      value: '',
    },
    ErrorHandler: errorHandler,
    AllowedChars: new RegExp('^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$'),
  });

  const localNetmask = useInputField({
    Field: {
      name: 'Local Netmask',
      type: 'text',
      value: '',
    },
    ErrorHandler: errorHandler,
    AllowedChars: new RegExp('^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$'),
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (DefaultConfiguration) {
      localIp.methods.setInputFieldValue(DefaultConfiguration?.ipScan?.localIp);
      localNetmask.methods.setInputFieldValue(DefaultConfiguration?.ipScan?.localNetmask);
      const services = [];
      DefaultConfiguration?.zeroconf?.services?.forEach((_, idx) => {
        services.push(new IndexPath(idx));
      });
      setZConfServicesIdx(services);
      setConfig(DefaultConfiguration);
    }
  }, [DefaultConfiguration]);

  useEffect(() => {
    if (back) {
      setLoading(false);
      navigation.navigate('Discovery', { config: true });
    }
  }, [config]);

  const [loading, setLoading] = useState(false);

  async function fetchConfig(values) {
    dispatch(requestDiscoveryConfig(values));
  }

  const LoadingIndicator = (props) => (
    (loading) ? (
      <View {...props}>
        <Spinner status="primary" size="small" />
      </View>
    )
      : null
  );

  const onUpdateConfig = (data) => {
    fetchConfig(data);
    setBack(true);
  };

  const groupDisplayValues = zconfServicesIdx.map((index) => config.zeroconf.services[index.row]);

  const Component = (
    <>
      <View style={styles.inputContainer}>
        <Input
          {...timeout.props}
          label="Timeout"
          placeholder="in miliseconds"
          keyboardType="decimal-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <Input
          {...localIp.props}
          label="Local IP Address"
          placeholder="XXX.XXX.XXX.XXX"
          keyboardType="decimal-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <Input
          {...localNetmask.props}
          label="Local Netmask"
          placeholder="XXX.XXX.XXX.XXX"
          keyboardType="decimal-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <Select
          label="ZerConf Services"
          placeholder="Select from available services"
          value={groupDisplayValues.join(', ')}
          disabled={!DefaultConfiguration?.zeroconf?.services.length}
          multiSelect
          selectedIndex={zconfServicesIdx}
          onSelect={(index) => setZConfServicesIdx(index)}
        >
          {
            DefaultConfiguration?.zeroconf?.services?.map((service, idx) => (
              <SelectItem title={service} key={idx} />
            ))
          }
        </Select>
      </View>
      <View style={styles.submitControl}>
        <Button
          status="basic"
          style={{ elevation: 2 }}
          accessoryLeft={LoadingIndicator}
          onPress={async () => {
            setLoading(true);
            const result = await Validate();
            if (result.status) {
              onUpdateConfig(result.data);
            }
          }}
        >
          CONFIGURE
        </Button>
      </View>
    </>
  );

  const Validate = async () => {
    const status = (
      timeout.methods.validate()
      && localIp.methods.validate()
      && localNetmask.methods.validate());
    if (status) {
      console.log('^^^^^^^^^^^^^^^^^^^^^^^^');
      console.log(groupDisplayValues);
      console.log('^^^^^^^^^^^^^^^^^^^^^^^^');

      const data = {
        ipScan: {
          timeout: Number(timeout.props.value),
          localIp: localIp.props.value,
          localNetmask: localNetmask.props.value,
        },
        zeroconf: {
          services: groupDisplayValues,
        },
      };

      return { status, data };
    }
    return { status };
  };

  return Component;
};

export default function Configure({ navigation, route }) {
  const theme = useTheme();
  const error = useErrorHandler({ text: '', isVisible: false });

  return (
    <>
      <View style={{
        zIndex: 10,
        top: 0,
        width: '100%',
        position: 'absolute',
      }}
      >
        <Error {...error.props} />
      </View>
      <SafeAreaView style={[styles.container, { backgroundColor: theme['background-basic-color-3'] }]}>
        <View>
          <ScrollView
            contentContainerStyle={{
              alignItems: 'center',
              flexGrow: 1,
              padding: '5%',
            }}
            scrollEnabled
          >
            <View style={styles.sectionContainer}>
              <ConfigForm errorHandler={error} navigation={navigation} route={route} />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: '7%',
  },
  sectionContainer: {
    padding: '1.75%',
    width: '90%',
    minHeight: '70%',
  },
});
