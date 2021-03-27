import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native'
import { Row, Column, Sm, Md, Lg, SmLabel, LgLabel, MdLabel } from '../shared/components/layout'
import { useTheme, Layout, Text } from '@ui-kitten/components';
import { useSelector } from 'react-redux';
import moment from 'moment'

function SearchScreen({ navigation, route }) {
  const theme = useTheme()
  const data = useSelector( state => state.discoveryReducer?.old )

  const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: theme['background-basic-color-4'] ,
        }}
      />
    );
  };

  return (
    <Layout level="2" style={{flex:1}}>
      <FlatList
        keyExtractor={(item, index) => `${index}`}
        data={data}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate(route.params.screenName, { scanInfo: item })}>
            <Row>
              <Sm>
                <Text style={{ padding: 18, }} category="s1">{item.discovered.length}</Text>
              </Sm>
              <Lg>
                <Column>
                  <Text category="s1">{moment(item.execution).format('MMMM Do, h:mm:ss a')}</Text>
                  {/* <Text category="c1" appearance="hint">{item.state}</Text> */}
                </Column>
              </Lg>
            </Row>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={renderSeparator}
      />
    </Layout>
  );

}


export default SearchScreen