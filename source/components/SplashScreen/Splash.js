import React, { Component } from 'react';
import { Text, View, Image, Animated, ImageBackground, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ApiController from '../../ApiController/ApiController';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-simple-toast';
import LocalDB from '../../LocalDB/LocalDB';

export default class Splash extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    }
  }
  static navigationOptions = { headerShown: false };
  splash_old = async () => {

    response = await ApiController.get('settings');
    if (response.success === true) {

      var userDetail = await LocalDB.getUserProfile();
      if (userDetail !== null) {
        if (userDetail.user_type == 'nurse') {
          this.getNurseProfile(userDetail.user_id)
        }
        if (userDetail.user_type == 'dentist') {
          this.getDoctorProfile(userDetail.user_id)
        }

      }
      else {
        this.props.navigation.replace('Intro'); //MainScreen
      }


    }
  }

    splash = async () => {

      //this.remove_local_data();


      var userDetail = await LocalDB.getUserProfile();
      if (userDetail !== null) {
          this.props.navigation.replace('Intro'); //MainScreen
      }
      else {
        this.props.navigation.replace('MainScreen'); //MainScreen
      }

    }

    remove_local_data = async () => {
      try {
        const data = await AsyncStorage.removeItem('poll_questions_data');
      } catch (error) {
      }
    }




  getDoctorProfile = async (user_id) => {

    let params = {
      user_id: user_id
    }

    let response = await ApiController.post('get_user_data', params)
    if (response.success === true) {
      var user_data = response.data;
      if (user_data.approval_status == 'Approved') {
        await LocalDB.saveProfile(user_data);
        if (user_data.profile_completed == 'Completed') {
          this.props.navigation.replace('DashboardDentist');
        }
        else {
          Toast.show('Please complete your profile to continue using App with better performance.');
          this.props.navigation.replace('EditProfile', { forcefully: 'yes' });
        }
      }
      else {

        Toast.show('Your profile status is currently ' + user_data.approval_status + ', Please wait untill admin approved your prifle, after that you can log in into the App.');
        this.props.navigation.replace('MainScreen'); //MainScreen
      }
    }
    else {
      Toast.show(response.message);
    }
  }




  componentDidMount() {
    this.splash();
  }
  render() {
    return (
      <View style={styles.container}>
        <Image style={{ width: 250, height: 120 }} source={require('../../images/logo.png')} />
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
    alignItems: 'center'
  },

});
