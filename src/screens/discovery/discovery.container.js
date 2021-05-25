import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList } from 'react-native';
import {
  Button, Layout, Spinner, CheckBox,
} from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { PropTypes } from 'prop-types';

import * as Location from 'expo-location';

import { Row, Md } from '../shared/components/Layout';
import { DeviceInfoCard } from './components/DeviceInfo';
import {
  startDiscovery, requestDiscoveryConfig, terminateScan,
} from '../../redux/actions/discovery';
import ScanInfo from './components/ScanInfo';
import SearchBox from './components/SearchBox';

Discovery.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      config: PropTypes.shape(),
      scanInfo: PropTypes.shape({
        config: PropTypes.shape(),
      }),
    }),
  }).isRequired,
};

export default function Discovery({ navigation, route }) {
  const dispatch = useDispatch();
  const lastScan = useSelector((state) => state.discovery.last);
  const Configuration = useSelector((state) => state.discovery.config);
  const [scanInfo, setScanInfo] = useState(lastScan);
  const status = useSelector((state) => state.discovery.isScanning);
  const finished = useSelector(({ discovery }) => discovery.last.time.end);
  const isReady = useSelector(({ discovery }) => discovery.isReady);
  const [isLoading, load] = useState(false);
  const [active, setActive] = useState([]);
  const [config, setConfig] = useState({});
  const [isDefaultConfig, setIsDefaultConfig] = useState(true);
  const [isBrowsingLogs, setIsBrowsingLogs] = useState(true);

  useEffect(() => {
    setScanInfo(lastScan);
  }, [lastScan]);

  useEffect(() => {
    if (!status) {
      setIsBrowsingLogs(true);
      setConfig(lastScan.config);
      load(false);
    } else {
      load(true);
    }
  }, [status]);

  const prevIsDefaultConfigRef = useRef();

  useEffect(() => {
    prevIsDefaultConfigRef.current = isDefaultConfig;
  });

  const prevIsDefaultConfig = prevIsDefaultConfigRef.current;

  useEffect(() => {
    if (prevIsDefaultConfig) {
      if (isDefaultConfig && !prevIsDefaultConfig) {
        dispatch(requestDiscoveryConfig());
      }
    }

    return () => {
      setConfig({});
    };
  }, [prevIsDefaultConfig, isDefaultConfig]);

  useEffect(() => {
    if (Configuration) {
      setConfig(Configuration);
    }

    return () => {
      setConfig({});
    };
  }, [Configuration]);

  useEffect(() => {
    try {
      // const newdt = mergeData(scanInfo?.discovered);
      // setActive([...newdt]);
      setActive(scanInfo?.discovered ?? []);
    } catch (error) {
      console.log(error.message);
    }
  }, [scanInfo?.discovered]);

  useEffect(() => {
    if (!isBrowsingLogs) {
      setIsDefaultConfig(true);
      setScanInfo({});
      setActive([]);
      Location.requestForegroundPermissionsAsync()
        .then(() => {
          Location.requestBackgroundPermissionsAsync()
            .finally(async () => {
              dispatch(requestDiscoveryConfig());
            });
        });
    }
  }, [isBrowsingLogs]);

  useEffect(() => {
    if (route.params?.config) {
      setConfig(Configuration);
    }
  }, [route.params?.config]);

  useEffect(() => {
    if (route.params?.scanInfo) {
      setIsBrowsingLogs(true);
      setScanInfo(route.params.scanInfo);
      setConfig(route.params.scanInfo.config);
    }
  }, [route.params?.scanInfo]);

  useEffect(() => { // terminate scan when all protocols finish
    if (status && finished.upnp && finished.zeroconf && finished.ipScan) {
      dispatch(terminateScan());
    }
  }, [status, finished]);

  const scan = () => dispatch(startDiscovery(dispatch, Configuration));

  const LoadingIndicator = (props) => (isLoading || (!isBrowsingLogs && !status && !isReady)) && (
    <View {...props}>
      <Spinner status="basic" size="small" />
    </View>
  );

  return (
    <Layout level="2">
      <FlatList
        onRefresh={null}
        refreshing={false}
        keyExtractor={(_, index) => String(index)}
        data={active}
        renderItem={({ item }) => (
          <DeviceInfoCard
            info={item}
            basic={{ execution: scanInfo?.start }}
            navigation={navigation}
          />
        )}
        ListHeaderComponent={(
          <Layout level="2">
            <View style={{ paddingVertical: '5%' }}>
              <Button
                status={status ? 'danger' : 'primary'}
                disabled={(!isBrowsingLogs
                  && (!isDefaultConfig && !Object.keys(config).length && !status))
                  || (!isBrowsingLogs && !status && !isReady)}
                onPress={() => (isBrowsingLogs
                  ? setIsBrowsingLogs(false)
                  : status
                    ? dispatch(terminateScan())
                    : scan())}
                style={{ width: '80%', alignSelf: 'center' }}
                accessoryLeft={LoadingIndicator}
              >
                {isBrowsingLogs && !status
                  ? 'NEW SCAN'
                  : status
                    ? 'TERMINATE'
                    : isReady
                      ? 'INITIATE SCAN'
                      : ''}
              </Button>
            </View>
            <View style={{ padding: '5%' }}>
              <SearchBox value={isBrowsingLogs ? moment(scanInfo?.start).format('MMMM Do, h:mm:ss a') : null} label="" screenName="Discovery" navigation={navigation} route={route} />
            </View>
            <Row>
              <Md end>
                <CheckBox
                  disabled={isBrowsingLogs || status}
                  checked={isDefaultConfig}
                  onChange={(nextChecked) => setIsDefaultConfig(nextChecked)}
                >
                  Default Config
                </CheckBox>
              </Md>
              <Md>
                <Button disabled={isDefaultConfig || isBrowsingLogs || status} size="small" onPress={() => navigation.navigate('Configure')} style={{ alignSelf: 'center' }}>CONFIGURE</Button>
              </Md>
            </Row>
            <View style={{ paddingVertical: '5%' }}>
              <Button
                disabled={(!isDefaultConfig || status) && !Object.keys(config).length}
                onPress={() => navigation.navigate('ConfigInfo', { configuration: JSON.stringify(config) })}
                style={{ width: '80%', alignSelf: 'center' }}
              >
                Check Configuration
              </Button>
            </View>
            <ScanInfo totalDevices={active.length} info={scanInfo} />
          </Layout>
        )}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      />
    </Layout>
  );
}
