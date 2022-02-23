/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {Platform,StatusBar} from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';
import Route from './source/MainRoute/Route';
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
        color: 'black',
        loading: false
    };
  };
  async componentDidMount(){
    //setTimeout(()=>{ this.setState({ color: store.statusbar_color }) },9000)

  }
  componentWillUnmount() {
       // this.notificationDisplayedListener();
       // this.notificationListener();
       // this.notificationOpenedListener();
    }
  // splash = async () => {
  //   let { orderStore } = Store;
  //   // API calling...
  //   this.setState({ loading: true })
  //   orderStore.settings = await ApiController.get('settings');
  //   if (orderStore.settings.success === true) {
  //       orderStore.statusbar_color = orderStore.settings.data.navbar_clr;
  //       this.setState({ loading: false })
  //   } else {
  //       this.setState({ loading: false })
  //   }
  // }
  // componentWillMount=async()=>{
  //   if(NetInfo.isConnected){
  //      await this.splash()
  //   }else{
  //     this.alert()
  //   }
  // }
  // componentDidMount() {
  //   NetInfo.isConnected.addEventListener(
  //     'connectionChange',
  //     (isConnected) => { isConnected ? this.splash(false) : this.alert() }
  //   );
  // }
  // alert() {
  //   // this.setState({ loading: true })
  //   Alert.alert(
  //     'No Internet',
  //     'Check your internet connection and try again',
  //     [
  //       // {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
  //       // { text: 'Exit', onPress: () =>  this.exit()},
  //       { text: 'Retry', onPress: () => this.internetCheck() }
  //     ],
  //     { cancelable: false }
  //   )
  // }
  // exit = () => BackHandler.exitApp();
  // internetCheck() {
  //   NetInfo.isConnected.fetch().then(isConnected => {
  //     (isConnected ? this.splash() : this.alert());
  //   });
  // }
  render() {
    return (
      <MenuProvider>
        <StatusBar
          hidden = {false}
          animated = {true}
          backgroundColor= { this.state.color }
          barStyle="light-content"
          networkActivityIndicatorVisible = {Platform.OS === 'ios'? false:false}
          showHideTransition = {Platform.OS === 'ios'? 'slide':null}
        />
        <Route />
        </MenuProvider>
     
    );
  }
}
