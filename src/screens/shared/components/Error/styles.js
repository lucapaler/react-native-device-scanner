import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    containerStyle: {
        backgroundColor: '#cd2701',
        opacity: 0.8,
        paddingVertical: '1%',
        paddingHorizontal: '1.5%',
        paddingRight: '2%'
    },
    closeContainer: {
        borderWidth: 1,
        borderWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 50
    },
    textContainerStyle: {
        justifyContent: 'center'
    },
    textStyle: {
        color: 'white', fontWeight: 'bold'
    },
    actionStyle: {
        alignItems: 'flex-end'
    },
    inputError: {
        color: 'red'
    },
    inputDefault: {
        color: 'black'
    }
});


