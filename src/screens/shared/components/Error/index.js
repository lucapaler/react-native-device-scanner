import React, { useState, useEffect } from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';


import { Row, VarView, VarLabel } from '../Layout'
import { useTheme } from '@ui-kitten/components';
import styles from './styles';



export function useError(initialVal) {
  const [msg, setMsg] = useState(initialVal)
  const [errObj, setErrObj] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (errObj) {
      setVisible(true)
      errObj.methods.setInputColor(styles.inputError.color)
      return () => {
        setVisible(false)
        errObj.methods.setInputColor(errObj.props.inputStyle.color)
      }
    }
  });



  return {
    props: {
      text: msg,
      obj: errObj,
      visible: visible
    },
    methods: {
      setText: setMsg,
      setObj: setErrObj,
      setVisible: setVisible
    }
  }
}




const Error = ({ text, visible, setVisible, style }) => {
  const theme = useTheme()
  // const error = props.error
  // if (!error.props.visible) {
  //     return null
  // }


  if (!visible) {
    return null
  }



  return (
    <Row style={{...styles.containerStyle, ...style,  backgroundColor: theme['color-danger-700']}}>
      <VarView size={9} ><MaterialIcons name="error-outline" size={24} color="white" /></VarView>
      <VarLabel size={1.28} containerStyle={styles.textContainerStyle} textStyle={styles.textStyle}>{text}</VarLabel>
      <VarView size={9} style={styles.actionStyle} >
        <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeContainer}>
          <Ionicons name="ios-close" size={24} color="white" />
        </TouchableOpacity>
      </VarView>
    </Row>
  )
}


export default Error