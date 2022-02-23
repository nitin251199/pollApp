import React, { Component } from 'react';
import { Text, View, Image,FlatList,TextInput, Animated, ImageBackground, TouchableOpacity,StyleSheet, ScrollView,PermissionsAndroid,Platform } from 'react-native';
import { Card, Title, Checkbox, Button, DefaultTheme, Provider as PaperProvider, Appbar, RadioButton } from 'react-native-paper';
import ApiController from '../../ApiController/ApiController';
import AsyncStorage from '@react-native-community/async-storage';

import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-simple-toast';
import LocalDB from '../../LocalDB/LocalDB';
import ImagePicker from 'react-native-image-crop-picker';
import Geolocation from '@react-native-community/geolocation';
import RNPickerSelect from 'react-native-picker-select';
import NetInfo from "@react-native-community/netinfo";
import Loader from '../Loader/Loader';

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 17,
    color: '#000000',
  },
  inputAndroid: {
    fontSize: 17,
    color: '#000000',
    borderWidth : 1,
    borderColor : '#000000'
  },
});


const theme = {
  backgroundColor: 'red',
  roundness: 2,
  colors: {
    backgroundColor: 'red',
    primary: '#0c9940',
    accent: '#0b353d',
  },
};



export default class Pendinglist extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pending_lists_html : [],
      pending_lists : null,
     
     
    }

  }






  get_local_pending_list = async () => { 

   
    //let userDetail = await LocalDB.getUserProfile();
    let poll_data = await LocalDB.getSurvayData();
    let pending_lists_html = [];
    for(let i=0;i<poll_data.length;i++)
    {
      pending_lists_html.push(
        <View  style={{ alignItems: 'center', marginBottom: 10,flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#ddd',padding:15 }} key={i}>
        <Text>{poll_data[i].name}</Text>
        <Text style={{fontWeight:'bold'}}>{poll_data[i].mobile}</Text>
        {
          
        <TouchableOpacity  onPress={() => {  this.props.navigation.navigate('Questionreview',{poll_data : poll_data[i]}) }}>
          <Text style={{ color:'green' }}>Review</Text>
          </TouchableOpacity>
        
        }
      </View>
      )
    }


    this.setState({
      pending_lists_html : pending_lists_html,
     
    })


  }
  


 



  displayToastMessage = async (msg) => {
    setTimeout(() => {
        Toast.show(msg);
    },300);
  }


  static navigationOptions = { headerShown: false };

  componentDidMount = async () => {
    this.get_local_pending_list();
    this.willFocusSubscription = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.get_local_pending_list();
      }
    );
   
  }


  componentWillUnmount() {

    //console.log("componentWillUnmount");
    this.willFocusSubscription.remove();
  }


  delete_record = async (account_id) => { 


    NetInfo.fetch().then(state => {
    
      if( state.isConnected == true )
      {
        this.delete_record_live(account_id);
      }
      else
      {
       let error = 'Please connect with internet for remove this account.';
        this.displayToastMessage(error);
  
      }
   
     });
  }



  delete_record_live = async (account_id) => {
  
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id:  userDetail.mem_id,
      account_id : account_id
    }
      let response = await ApiController.post('delete_under_accounts', params)
      if( response.success == 1 ) 
      {
        this.get_local_zc_accounts();
      }
      else
      {
          let error_msg =   'something goes wrong to delete data';
          this.displayToastMessage(error_msg); 
      }
  
  
  
  
  
  }



  render() {

    return (

      <View style={styles.container}>
      <Loader loading={this.state.loading} />

        <ScrollView>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image style={styles.logo} source={require('../../images/logo.png')} />
            <Text style={{ fontWeight: 'bold', }}>
            {this.state.election_name}
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text>Pending Surveys</Text>
          </View>

          {this.state.pending_lists_html}





         
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={() => { this.props.navigation.navigate('Intro') }}
            contentStyle={{ backgroundColor: '#0b353c',height:50 }}
            icon="chevron-left" mode="contained">
            BACK
          </Button>
         
        </View>

  

      


      </View>

    );
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: { width: 150, height: 80 },
  cardHeader: {
    backgroundColor: '#f5f5f5',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    padding:10
  },
  card_display: {
    margin: 15
  },
  card_none: {
    margin: 15,
    display : 'none'
  },

  footer: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 10,
    elevation: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#099943'
  },
  radiolist: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',

  },
  linebox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smile: {
    marginTop: 30,
    marginBottom: 5,
    height: 50,
    width: 50
  },
  smile_selected: {
    marginTop: 30,
    marginBottom: 5,
    height: 50,
    width: 50,
    borderColor:'green',
    borderWidth:1
  },
  mojilist: {
    alignItems: 'center'
  },
  boxstyle: {
    flexDirection: 'row'
  },
  boxstyle_full: {
    flex : 1
  },
  mainbox: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    marginBottom: 10
  },
  pagetitle: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  boxtitle: {

    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    fontSize: 15,
    padding: 10,
    lineHeight: 20
  },
  radiolist_half: {


    flex:1

  },


});
