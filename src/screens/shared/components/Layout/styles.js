import { StyleSheet } from 'react-native';
// import { colors } from '../../../assets/color'

export const container = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection:'row',
    // paddingVertical: '2%',
    // paddingHorizontal: '4%'
  },
  column: {
    flexDirection:'column',
    // paddingVertical: '1%',
    // paddingHorizontal: '2%'
  },
  sm:{
    flex: 0.25,
    justifyContent: 'center'

  },
  md:{
    flex: 0.5,
    justifyContent: 'center'

  },
  lg:{
    flex: 0.75,
    justifyContent: 'center'

  },
  xlg:{
    flex: 1,
  }
});


export const labels = StyleSheet.create({
  sm:{
    fontSize:13.5,
  },
  lg:{
    fontSize:13.5,
  },
  md:{
    fontSize:13.5,
  },
  xl:{
    paddingVertical: '10%'
  }
});



