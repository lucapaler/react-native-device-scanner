import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import moment from 'moment';
import {
  Layout, Text, Divider, Button, useTheme,
} from '@ui-kitten/components';
import { Row, Column, Md } from '../shared/components/Layout';
import Protocols from './components/Protocols';

export default function DeviceDetails({ navigation, route }) {
  const theme = useTheme();
  const [deviceInfo, setDeviceInfo] = useState({});
  const [basicInfo, setBasicInfo] = useState();

  useEffect(() => {
    if (route.params) {
      setDeviceInfo(route.params.deviceInfo);
      setBasicInfo(route.params.basicInfo);
    }
  }, [route.params]);

  return (
    <View style={{ flex: 1, backgroundColor: theme['background-basic-color-1'] }}>
      <ScrollView>
        <View>
          <Text category="h5" style={styles.title}>{deviceInfo?.ip}</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.preDescription}>
          <Row>
            <Protocols names={deviceInfo?.protocol} />
          </Row>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.details}>
          <Column>
            <Row>
              <Md>
                <Text category="s1" style={styles.statTitle}>Time Taken By:</Text>
              </Md>
            </Row>
            {
              deviceInfo?.protocol?.map((item, idx) => (
                <Row key={idx}>
                  <Md>
                    <Text category="s1" appearance="hint">{item}</Text>
                  </Md>
                  <Md><Text appearance="hint">{`${moment.duration(moment(deviceInfo?.timeStamp[idx]).diff(moment(basicInfo?.execution))).asMilliseconds()} ms`}</Text></Md>
                </Row>
              ))
            }
          </Column>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.details}>
          <Column>
            <Row>
              <Md>
                <Text category="s1" style={styles.statTitle}>Information Fetched: </Text>
              </Md>
            </Row>
            {Object.keys(deviceInfo)?.map((info, idx1) => {
              if (!['ip', 'protocol', 'timeStamp'].includes(info)) {
                return (
                  <Row key={idx1} style={{ marginBottom: '1%' }}>
                    <Md>
                      <Text category="s1" appearance="hint">{info}</Text>
                    </Md>
                    <Md>
                      {(info === 'txt'
                        ? [JSON.stringify(deviceInfo?.[info], null, 2)]
                        : [deviceInfo?.[info]])
                        .map((dt, idx2) => (
                          <Text key={idx2} appearance="hint">{`${dt}`}</Text>
                        ))}
                    </Md>
                  </Row>
                );
              }

              return null;
            })}
          </Column>
        </View>
      </ScrollView>
      <Layout level="3" style={{ padding: '3%' }}>
        <Button disabled>Port Scan</Button>
      </Layout>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    borderBottomWidth: 1,
    opacity: 0.1,
  },
  title: {
    padding: '3%',
    fontWeight: 'bold',
  },
  subTitle: {
    fontWeight: 'bold',
    // marginVertical:'3%'
  },
  statTitle: {
    fontWeight: 'bold',
    marginBottom: '7%',
  },
  shortDescription: {
    // backgroundColor:'red',
    // justifyContent:'center',
    paddingHorizontal: '3%',
    paddingBottom: '3%',
  },
  details: {
    padding: '4%',
  },
  timestamp: {
    padding: '2%',
  },
  description: {
    padding: '3%',
  },
  preDescription: {
    padding: '3%',
  },
  postDescription: {
    padding: '3%',
  },
  categoryContainer: {
    // width:'45%',
    flexDirection: 'row',
    // justifyContent:'center',
  },
  categoryItem: {
    // marginBottom:'3%',
    marginHorizontal: 4,
    borderRadius: 16,
  },
  textInput: {
    width: '80%',
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 20,
    fontSize: 24,
    borderBottomColor: '#7f8c8d33',
    borderBottomWidth: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  actionButton: {
    elevation: 3,
  },
});
