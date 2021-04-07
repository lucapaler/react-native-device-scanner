import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { networkPromise } from '../../lib/helpers'
import { Row, Md, Sm } from '../shared/components/Layout'
import { Button, Input, Layout, Spinner, CheckBox } from '@ui-kitten/components'
import { useDispatch, useSelector } from 'react-redux';
import { DeviceInfoCard } from './components/DeviceInfo'
import * as actions from '../../redux/actions/discovery'
import ScanInfo from './components/ScanInfo';
import moment from 'moment'
import SearchBox from './components/SearchBox'

const mergeData = (data) => new Promise((resolve) => {
    let output = []

    for (const item of data) {
        const existing = output.filter(x => x?.ip === item?.ip);
        if (existing.length) {
            const existingIndex = output.indexOf(existing[0]);
            const newKeys = Object.keys(item).filter(x => !Object.keys(output[existingIndex]).includes(x))
            for (const key of Object.keys(output[existingIndex])) {
                if (key !== 'ip' && Object.keys(item).includes(key) && !output[existingIndex][key].includes(item[key])) {
                    output[existingIndex][key].push(item[key])
                }
            }
            for (const key of newKeys) {
                output[existingIndex][key] = [item[key]]
            }
        } else {
            let updatedItem = {}
            for (const key of Object.keys(item)) {
                updatedItem[key] = (key === 'ip') ? item[key] : [item[key]]
            }
            output.push(updatedItem)
        }
    };

    resolve(output)
})

const Discovery = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const Devices = useSelector(state => state.discoveryReducer?.last)
    const Configuration = useSelector(state => state.discoveryReducer?.config)
    const [scanInfo, setScanInfo] = useState({})
    const status = useSelector(state => state.discoveryReducer?.scan)
    const [active, setActive] = useState([])
    const [config, setConfig] = useState({})
    const [isDefaultConfig, setIsDefaultConfig] = useState(true)
    const [isBrowsingLogs, setIsBrowsingLogs] = useState(true)

    useEffect(() => {
            setScanInfo(Devices)
        
    }, [Devices])

    useEffect(() => {
        if(!status){
            setIsBrowsingLogs(true)
            setConfig(Devices.config)
        }
    }, [status])

    useEffect(() => {
        if (isDefaultConfig) {
            fetchConfig()
        }

        return () => {
            setConfig({})
        }

    }, [isDefaultConfig])

    useEffect(() => {
        if (Configuration) {
            setConfig(Configuration)
        }


        return () => {
            setConfig({})
        }

    }, [Configuration])


    useEffect(() => {

        async function merge() {
            try {

                const newdt = await mergeData(scanInfo?.discovered)
                console.log(newdt)
                setActive([...newdt])
            } catch (error) {
                console.log(error.message)
            }
        }

        merge()

    }, [scanInfo])

    useEffect(() => {
        if(!isBrowsingLogs){
            setIsDefaultConfig(true)
            setScanInfo({})
            setActive([])
            fetchConfig()
        }

    }, [isBrowsingLogs])

    useEffect(() => {
        if (route.params?.config) {
            setConfig(Configuration)
        }

    }, [route.params?.config])

    useEffect(() => {

        if (route.params?.scanInfo) {
            setIsBrowsingLogs(true)
            setScanInfo(route.params.scanInfo)
            setConfig(route.params.scanInfo.config)
        }
        
    }, [route.params?.scanInfo])

    const scan = () => dispatch(actions.startDiscovery(dispatch, Configuration))

    const LoadingIndicator = (props) => {
        return (
            (status) ? (
                <View {...props}>
                    <Spinner status="basic" size='small' />
                </View>
            )
                : null
        )
    };

    async function fetchConfig() {
        dispatch(actions.requestDiscoveryConfig())
    }

    return (
        <Layout level="2">
            <FlatList
                onRefresh={scan}
                refreshing={false}
                keyExtractor={(item, index) => `${index}`}
                data={active}
                renderItem={({ item }) =>
                    <DeviceInfoCard info={item} basic={{ execution: scanInfo?.execution }} navigation={navigation} />
                }
                ListHeaderComponent={<Layout level="2">
                    <View style={{ paddingVertical: '5%' }}>
                        <Button 
                            status={(status)? 'danger': 'primary'}
                            disabled={isBrowsingLogs? false: (!isDefaultConfig && !Object.keys(config).length && !status)} 
                            onPress={() =>  isBrowsingLogs? setIsBrowsingLogs(false) : (status)? dispatch(actions.endDiscovery()) : scan()} 
                            style={{ width: '80%', alignSelf: 'center' }} 
                            accessoryLeft={LoadingIndicator}>
                                {isBrowsingLogs? `NEW SCAN`: (status)? `TERMINATE`: `INITIATE SCAN`}
                        </Button>
                    </View>
                    <View style={{ padding: '5%' }}>
                        <SearchBox value={isBrowsingLogs? moment(scanInfo?.execution).format('MMMM Do, h:mm:ss a'): null} label="" screenName="Discovery" navigation={navigation} route={route} />
                    </View>
                    <Row>
                        <Md end>
                            <CheckBox
                                disabled={isBrowsingLogs || status}
                                checked={isDefaultConfig}
                                onChange={nextChecked => setIsDefaultConfig(nextChecked)}>
                                Default Config
                    </CheckBox>
                        </Md>
                        <Md>
                            <Button disabled={isDefaultConfig || isBrowsingLogs || status} size='small' onPress={() => navigation.navigate('Configure')} style={{ alignSelf: 'center' }} >CONFIGURE</Button>
                        </Md>
                    </Row>
                    <View style={{ paddingVertical: '5%' }}>
                        <Button 
                            disabled = {(!isDefaultConfig || status) && !Object.keys(config).length}
                            onPress={() => navigation.navigate('ConfigInfo', { config: config })} 
                            style={{ width: '80%', alignSelf: 'center' }} 
                        >
                            Check Configuration
                        </Button>
                    </View>
                    <ScanInfo totalDevices={active.length} info={scanInfo} />
                </Layout>}
                stickyHeaderIndices={[0]}
                showsVerticalScrollIndicator={false}
            />

        </Layout>
    )
}

export default Discovery