import React from 'react'
import { View } from 'react-native'
import { Row, Md } from '../../shared/components/layout'
import { Text, Card } from '@ui-kitten/components'
import Protocols from './Protocols'

export const DeviceInfoCard = ({ info, basic, navigation }) => {
    return (
        <>
            <Row>
                <Card
                    style={{ width: '100%' }}
                    appearance="filled"
                    onPress={() => navigation.navigate('DeviceDetails', { deviceInfo: info, basicInfo: basic })}
                >
                    <View>
                        <Row>
                            <Md>
                                <Text category='h6'>{info.ip}</Text>
                            </Md>
                            <Md>
                                <Protocols names={info.protocol} />
                            </Md>
                        </Row>
                    </View>
                </Card>
            </Row>
        </>
    )
}