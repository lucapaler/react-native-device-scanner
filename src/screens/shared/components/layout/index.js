import React from 'react';
import { View, Text } from 'react-native';

import { container, labels } from './styles';



export const MainLayout = (props) => {
  const { children, style, ...other } = props
  return (
    <View style={{ ...container.main, ...style }} {...other}>
      {children}
    </View>
  );
}


export const Row = (props) => {
  const { children, style, ...other } = props
  return (
    <View style={{ ...container.row, ...style }} {...other}>
      {children}
    </View>
  );
}


export const Column = (props) => {
  const { children, style, ...other } = props
  return (
    <View style={{ ...container.column, ...style }} {...other}>
      {children}
    </View>
  );
}


export const Sm = (props) => {
  const { children, style, ...other } = props
  return (
    <View style={{ ...container.sm, ...style }} {...other}>
      {children}
    </View>
  );
}

export const Md = (props) => {
  const { children, style, end, ...other } = props
  
  return (
    <View style={{ ...container.md, ...style,  ...(end && { alignItems: 'flex-end' } )}} {...other}>
      {children}
    </View>
  );
}

export const Lg = (props) => {
  const { children, style, ...other } = props
  return (
    <View style={{ ...container.lg, ...style }} {...other}>
      {children}
    </View>
  );
}

export const XLg = (props) => {
  const { children, style, ...other } = props
  return (
    <View style={{ ...container.xlg, ...style }} {...other}>
      {children}
    </View>
  );
}

export const SmLabel = (props) => {
  const { children, containerStyle, textStyle, ...other } = props
  return (
    <Sm style={{ ...containerStyle }}>
      <Text style={{ ...labels.sm, ...textStyle }} {...other}>
        {children}
      </Text>
    </Sm>
  );
}

export const MdLabel = (props) => {
  const { children, containerStyle, textStyle, ...other } = props
  return (
    <Md style={{ ...containerStyle }}>
      <Text style={{ ...labels.md, ...textStyle }} {...other}>
        {children}
      </Text>
    </Md>
  );
}

export const LgLabel = (props) => {
  const { children, containerStyle, textStyle, ...other } = props
  return (
    <Lg style={{ ...containerStyle }}>
      <Text style={{ ...labels.lg, ...textStyle }} {...other}>
        {children}
      </Text>
    </Lg>
  );
}

export const VarView = (props) => {
  const { children, size, style, ...other } = props
  return (
    <View style={{ ...style, flex: 1 / size }} {...other}>
      {children}
    </View>
  )
}

export const VarLabel = (props) => {
  const { children, size, containerStyle, textStyle, ...other } = props
  return (
    <VarView style={{ ...containerStyle }} size={size}>
      <Text style={{ ...labels.lg, ...textStyle }} {...other}>
        {children}
      </Text>
    </VarView>
  )
}


