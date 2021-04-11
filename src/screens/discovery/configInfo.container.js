import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Divider, useTheme } from '@ui-kitten/components'
import { Row, Column, Md } from '../shared/components/Layout'
import { StyleSheet } from 'react-native';


const ConfigDetail = ({ config, protocol }) => (
    <>
        <View style={styles.details}>
            <Column>
                <Row>
                    <Md>
                        <Text category="s1" style={styles.statTitle}>{protocol}</Text>
                    </Md>
                </Row>
                {
                    Object.keys(config)?.map((info, idx) => (
                        <Row key={idx}>
                            <Md>
                                <Text category="s1" appearance="hint">{info}</Text>
                            </Md>
                            <Md><Text appearance="hint">{`${JSON.stringify(config[info], undefined,  7)}`}</Text></Md>
                        </Row>
                    ))
                }
            </Column>
        </View>
        <Divider style={styles.divider} />
    </>
)



const ConfigurationDetails = ({ navigation, route }) => {

    const theme = useTheme()
    const [config, setConfig] = useState({})

    useEffect(() => {
        if (route.params?.configuration) {
            setConfig(JSON.parse(route.params.configuration))
        }
    }, [route.params])



    return (
        <View style={{ flex: 1, backgroundColor: theme['background-basic-color-1'] }}>
            <ScrollView>
                <View>
                    {/* <Text category="h5" style={styles.title}>{deviceInfo?.ip}</Text> */}
                </View>
                <Divider style={styles.divider} />
                {
                    Object.keys(config).map((protocol, idx) => (
                        <ConfigDetail protocol={protocol} key={idx} config={config[protocol]} />
                    ))
                }
            </ScrollView>
        </View>
    );
}

export default ConfigurationDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        borderBottomWidth: 1,
        opacity: 0.1
    },
    title: {
        padding: '3%',
        fontWeight: 'bold'
    },
    statTitle: {
        fontWeight: 'bold',
        marginBottom: '7%'
    },
    details: {
        padding: '4%'
    }
});
