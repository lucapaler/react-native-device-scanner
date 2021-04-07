import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Input, Icon } from '@ui-kitten/components';


const ListIcon = (style) => (
    <Icon name="list" {...style} />
)

const SearchBox = (props) => {
    const { navigation, categoryId, screenName, ...other } = props
    return (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate('ScanLogs', {
                screenName: screenName,
            })}}
            activeOpacity={1}>
            <View pointerEvents="none">
                <Input
                    {...other}
                    placeholder="Scan Logs"
                    editable={false}
                    accessoryRight={ListIcon}
                />
            </View>
        </TouchableOpacity>
    );
}


export default SearchBox

