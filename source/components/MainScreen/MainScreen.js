import React, { Component } from 'react';
import { Text, Linking, View, ImageBackground, ScrollView,TouchableOpacity, SafeAreaView, TextInput, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-simple-toast';
import LocalDB from '../../LocalDB/LocalDB';
import ApiController from '../../ApiController/ApiController';
import Geolocation from '@react-native-community/geolocation';
import ImagePicker from 'react-native-image-crop-picker';
import NetInfo from "@react-native-community/netinfo";
export default class MainScreen extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      mobile : ''
    }
  }


  displayToastMessage = async (msg) => {
    setTimeout(() => {
        Toast.show(msg);
    },300);
  }


    static navigationOptions = { headerShown: false };
  componentDidMount = async () => {


  

  }

  getLocation = async () => {
    Geolocation.getCurrentPosition(info => console.log(info));
  }

  open_camera = async () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      includeBase64: true,
      includeExif: true,
      cropping: true

    }).then(image => {
      console.log('image:', image);
    });
  }


  checkInternet = async () => {

    NetInfo.fetch().then(state => {

     if( state.isConnected == true )
     {
        this.submit();
     }
     else
     {
      let error_msg =   'No internet connection found, please connect mobile data or wi-fi to login';
      this.displayToastMessage(error_msg);
     }

    });


  }



  submit = async () => {

      let params = {
        mobile: this.state.mobile,
      }

      if( this.state.mobile != ''  )
      {
        console.log('login_param',params);
        this.setState({ loading: true })
        let response = await ApiController.post('signin', params)
        this.setState({ loading: false })
        console.log("signin",response);
        if( response.success == 1 )
        {
            let user_data = {
              mem_id : response.data.mem_id,
              parent_id : response.data.parent_id,
              zone_id : response.data.zone_id,
              member_role : response.data.member_role,
              name : response.data.name,
              phone_number : response.data.phone_number,
            }
            await LocalDB.saveProfile(user_data);
            this.props.navigation.navigate('Intro');

        }
        else
        {
            let error_msg =   response.error_msg;
            this.displayToastMessage(error_msg);

        }
      }
      else
      {
          let error_msg= "Please enter mobile number to login";
          this.displayToastMessage(error_msg);
      }



  }






  render() {
    return (

      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Image style={styles.logo} source={require('../../images/logo.png')} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Mobile Number"
          keyboardType="numeric"
          maxLength={10}
          maxLength={10}
          placeholderTextColor="gray"
          value={this.state.mobile }
          onChangeText={(mobile ) => this.setState({mobile : mobile })}

        />
        <TouchableOpacity onPress={() => {  this.checkInternet()  }}
          style={{ backgroundColor: '#0d9942', marginHorizontal: 20, borderRadius: 50, paddingVertical: 15, marginTop: 30 }}><Text style={{ textAlign: 'center', color: '#fff' }}>Submit</Text></TouchableOpacity>
      </View>



    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 8,
  },
  logo: { width: 250, height: 120 },
  input: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingBottom: 15,
    marginHorizontal: 20,
    color: '#000'
  },
});
