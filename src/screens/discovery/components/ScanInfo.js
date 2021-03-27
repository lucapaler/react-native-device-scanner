import React from 'react'
import moment from 'moment'
import { View } from 'react-native'
import { Column, Row, Md } from '../../shared/components/layout'
import { Text } from '@ui-kitten/components'


const ScanInfo = (props) => {
    const { info, totalDevices } = props

    return (<View style={{padding:'4%'}}>
        <Column>
            <Row>
                <Md><Text category="s1">Executed At:</Text></Md>
                <Md><Text appearance="hint">{moment(info.execution).format('MMMM Do, h:mm:ss a')}</Text></Md>
            </Row>
            <Row>
                <Md><Text category="s1">Devices Found:</Text></Md>
                <Md><Text appearance="hint">{totalDevices}</Text></Md>
            </Row>
            <Row>
                <Md><Text category="s1">Terminated At:</Text></Md>
                <Md><Text appearance="hint">{info.termination? moment(info.termination).format('MMMM Do, h:mm:ss a'): '--'}</Text></Md>
            </Row>
        </Column>
    </View>)
}

export default ScanInfo