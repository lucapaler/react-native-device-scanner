import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, ScrollView, SafeAreaView } from 'react-native'
import { Input, Button, Spinner, Text, Toggle, useTheme, IndexPath, SelectItem, Select } from '@ui-kitten/components';
import Error from '../shared/components/Error'
import { useInputField, useErrorHandler, useToggleState } from '../shared/effects/form'
import { StyleSheet } from 'react-native';
import { requestDiscoveryConfig } from '../../redux/actions/discovery'


const ConfigForm = ({ navigation, route, errorHandler }) => {

    const dispatch = useDispatch()
    const DefaultConfiguration = useSelector(state => state.discovery?.config)
    const [config, setConfig] = useState({})
    const [back, setBack] = useState(false)
    const [zconfServicesIdx, setZConfServicesIdx] = useState([])

    const timeout = useInputField({
        Field: {
            name: 'Timeout (IP Scan)',
            type: 'numeric',
            value: 100
        },
        ErrorHandler: errorHandler,
        Limit: {
            min: 0,
            max: 10000
        }
    })

    const local_ip = useInputField({
        Field: {
            name: 'Local Ip Address',
            type: 'text',
            value: ''
        },
        ErrorHandler: errorHandler,
        AllowedChars: new RegExp('^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$')
    })

    const local_netmask = useInputField({
        Field: {
            name: 'Local Netmask',
            type: 'text',
            value: ''
        },
        ErrorHandler: errorHandler,
        AllowedChars: new RegExp('^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$')
    })

    useEffect(() => {
        fetchConfig()
    }, [])

    useEffect(() => {
        if (DefaultConfiguration) {
            local_ip.methods.setInputFieldValue(DefaultConfiguration?.ipScan?.local_ip)
            local_netmask.methods.setInputFieldValue(DefaultConfiguration?.ipScan?.local_netmask)
            let services = []
            DefaultConfiguration?.zeroConf?.services?.forEach((service, idx) => {
                services.push(new IndexPath(idx))
            })
            setZConfServicesIdx(services)
            setConfig(DefaultConfiguration)
        }
    }, [DefaultConfiguration])

    useEffect(() => {
        if (back) {
            setLoading(false)
            navigation.navigate('Discovery', { config: true });
        }
    }, [config])

    const [loading, setLoading] = useState(false)

    async function fetchConfig(values) {
        dispatch(requestDiscoveryConfig(values))
    }


    const LoadingIndicator = (props) => {
        return (
            (loading) ? (
                <View {...props}>
                    <Spinner status="primary" size='small' />
                </View>
            )
                : null
        )
    };

    const onUpdateConfig = (data) => {
        fetchConfig(data)
        setBack(true)
    }

    const groupDisplayValues = zconfServicesIdx.map((index) => config.zeroConf.services[index.row])


    const Component = (
        <>

            <View style={styles.inputContainer}>
                <Input
                    {...timeout.props}
                    label={"Timeout"}
                    placeholder='in miliseconds'
                    keyboardType="decimal-pad"
                />
            </View>

            <View style={styles.inputContainer}>
                <Input
                    {...local_ip.props}
                    label={"Local IP Address"}
                    placeholder="XXX.XXX.XXX.XXX"
                    keyboardType="decimal-pad"
                />
            </View>

            <View style={styles.inputContainer}>
                <Input
                    {...local_netmask.props}
                    label={"Local Netmask"}
                    placeholder="XXX.XXX.XXX.XXX"
                    keyboardType="decimal-pad"
                />
            </View>

            <View style={styles.inputContainer}>
                <Select
                    label="ZerConf Services"
                    placeholder="Select from available services"
                    value = {groupDisplayValues.join(', ')}
                    disabled={DefaultConfiguration?.zeroConf?.services.length? false: true}
                    multiSelect={true}
                    selectedIndex={zconfServicesIdx}
                    onSelect={index => setZConfServicesIdx(index)}>
                    {
                        DefaultConfiguration?.zeroConf?.services?.map((service, idx) => (
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
                        setLoading(true)
                        const result = await Validate()
                        if (result.status) {
                            onUpdateConfig(result.data)
                        }
                    }
                    }>
                    CONFIGURE
                </Button>
            </View>
        </>
    )

    const Validate = async () => {
        const status = (
            timeout.methods.validate() &&
            local_ip.methods.validate() &&
            local_netmask.methods.validate())
        if (status) {


            console.log('^^^^^^^^^^^^^^^^^^^^^^^^')
            console.log(groupDisplayValues)
            console.log('^^^^^^^^^^^^^^^^^^^^^^^^')

            const data = {
                ipScan: {
                    timeout: Number(timeout.props.value),
                    local_ip: local_ip.props.value,
                    local_netmask: local_netmask.props.value
                },
                zeroConf: {
                    services: groupDisplayValues
                }
            }

            return { status, data }
        } else {
            return { status }
        }
    }

    return Component
}



export default function Configure({ navigation, route }) {

    const theme = useTheme()
    const error = useErrorHandler({ text: '', isVisible: false })

    return (
        <>
            <View style={{
                zIndex: 10,
                top: 0,
                width: '100%',
                position: 'absolute'
            }}>
                <Error {...error.props} />
            </View>
            <SafeAreaView style={[styles.container, { backgroundColor: theme['background-basic-color-3'] }]}>
                <View>

                    <ScrollView contentContainerStyle={{
                        alignItems: 'center',
                        flexGrow: 1,
                        padding: '5%'
                    }}
                        scrollEnabled={true}
                    >
                        <View style={styles.sectionContainer}>
                            <ConfigForm errorHandler={error} navigation={navigation} route={route} />
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </>
    )

}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
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
