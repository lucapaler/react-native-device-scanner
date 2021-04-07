import React, { useEffect, useState } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { networkPromise } from '../../lib/helpers'
import { Row, Md, Sm } from '../shared/components/Layout'
import { Button, Input, Layout, Spinner, CheckBox } from '@ui-kitten/components'
import { useDispatch, useSelector } from 'react-redux';
import { DeviceInfoCard } from './components/DeviceInfo'
import * as actions from '../../redux/actions/discovery'
import ScanInfo from './components/ScanInfo';
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

    // console.log(output)

    resolve(output)
})

const Discovery = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const Devices = useSelector(state => state.discoveryReducer?.last)
    const [scanInfo, setScanInfo] = useState({})
    const status = useSelector(state => state.discoveryReducer?.scan)
    const [active, setActive] = useState([])
    // const [config, setConfig] = useState({ ipScan: { timeout: 100 } })
    const [defaultConfig, setDefaultConfig] = useState(true)
    const [config, setConfig] = useState({})


    useEffect(() => {
        setScanInfo(Devices)
    }, [Devices])

    useEffect(() => {
        if (defaultConfig) {
            fetchConfig()
        }

        return () => {
            setConfig({})
        }

    }, [defaultConfig])


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

        console.log(route.params)

        if (route.params?.scanInfo) {
            setScanInfo(route.params.scanInfo)
        }

        if (route.params?.config) {
            setConfig(route.params.config)
        }
    }, [route.params])

    const scan = () => dispatch(actions.startDiscovery(dispatch, config))


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
        const response = await networkPromise()
        setConfig({ ...config, ipScan: { ...response, timeout: 100 } })
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
                        <Button disabled={Object.keys(config).length ? false : true} onPress={() => scan()} style={{ width: '80%', alignSelf: 'center' }} accessoryLeft={LoadingIndicator}>SCAN</Button>
                    </View>
                    <View style={{ padding: '5%' }}>
                        <SearchBox label="" screenName="Discovery" navigation={navigation} route={route} />
                    </View>
                    <Row>
                        <Md end>
                            <CheckBox
                                checked={defaultConfig}
                                onChange={nextChecked => setDefaultConfig(nextChecked)}>
                                Default Config
                    </CheckBox>
                        </Md>
                        <Md>
                            <Button disabled={defaultConfig} size='small' onPress={() => navigation.navigate('Configure')} style={{ alignSelf: 'center' }} >CONFIGURE</Button>
                        </Md>
                    </Row>
                    <ScanInfo totalDevices={active.length} info={scanInfo} />
                </Layout>}
                stickyHeaderIndices={[0]}
                showsVerticalScrollIndicator={false}
            />

        </Layout>
    )
}

export default Discovery