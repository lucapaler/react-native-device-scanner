import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Button } from '@ui-kitten/components'

const status = {
    'IP-Scan': 'primary',
    "UPnP": 'info',
    'ZConf': 'basic'
}


const Protocols = ({ names }) => (
    <View style={styles.categoryContainer}>
        {
            names?.map((item, idx) => (
                <Button
                    status={status[item]}
                    key={idx}
                    style={styles.categoryItem}
                    size='tiny'
                >
                    {item}
                </Button>
            ))
        }
    </View>
)

const styles = StyleSheet.create({
    categoryContainer: {
        flexDirection: 'row',
    },
    categoryItem: {
        marginHorizontal: 4,
        borderRadius: 16,
    }
});


export default Protocols