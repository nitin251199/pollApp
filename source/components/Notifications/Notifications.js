import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  FlatList,
  TextInput,
  Animated,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from "react-native";
import {
  Card,
  Title,
  Checkbox,
  Button,
  DefaultTheme,
  Provider as PaperProvider,
  Appbar,
  RadioButton,
} from "react-native-paper";
import ApiController from "../../ApiController/ApiController";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Animatable from "react-native-animatable";
import Toast from "react-native-simple-toast";
import LocalDB from "../../LocalDB/LocalDB";
import ImagePicker from "react-native-image-crop-picker";
import Geolocation from "@react-native-community/geolocation";
import RNPickerSelect from "react-native-picker-select";
import NetInfo from "@react-native-community/netinfo";
import Loader from "../Loader/Loader";

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 17,
    color: "#000000",
  },
  inputAndroid: {
    fontSize: 17,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#000000",
  },
});

const theme = {
  backgroundColor: "red",
  roundness: 2,
  colors: {
    backgroundColor: "red",
    primary: "#0c9940",
    accent: "#0b353d",
  },
};

export default class Notifications extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      zc_accounts_html: [],
      zc_accounts: null,
      zc_count: null,
    };
  }

  get_local_zc_accounts = async () => {
    let zc_accounts = await LocalDB.getNotifications();

    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        this.get_zc_accounts();
      } else {
        let zc_count = 0;
        if (zc_accounts != null) {
          zc_count = zc_accounts.length;
        }
        let zc_accounts_list = [];
        for (let i = 0; i < zc_accounts.length; i++) {
          zc_accounts_list.push(
            <View key={i} style={styles.notilist}>
              <View style={{ marginHorizontal: 15, flex: 1 }}>
                <Text style={styles.textbold}>{zc_accounts[i].title}</Text>
                <Text style={styles.textnormal}>{zc_accounts[i].detail}</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.textsmall}>
                    {zc_accounts[i].add_date}
                  </Text>
                </View>
              </View>
            </View>
          );
        }

        this.setState({
          zc_accounts: zc_accounts,
          zc_count: zc_count,
          zc_accounts_html: zc_accounts_list,
        });
      }
    });
  };

  get_zc_accounts = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
    };
    let response = await ApiController.post("get_notifications", params);
    console.log("get_notifications", response);
    if (response.success == 1) {
      await AsyncStorage.removeItem("poll_notification_data");
      await LocalDB.saveNotifications(response.data);
      let zc_accounts = response.data;
      let zc_accounts_list = [];

      for (let i = 0; i < zc_accounts.length; i++) {
        zc_accounts_list.push(
          <View key={i} style={styles.notilist}>
            <View style={{ marginHorizontal: 15, flex: 1 }}>
              <Text style={styles.textbold}>{zc_accounts[i].title}</Text>
              <Text style={styles.textnormal}>{zc_accounts[i].detail}</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.textsmall}>{zc_accounts[i].add_date}</Text>
              </View>
            </View>
          </View>
        );
      }

      this.setState({
        zc_accounts: response.data,
        zc_count: response.data.length,
        zc_accounts_html: zc_accounts_list,
      });
    } else {
      let error_msg = "something goes wrong to get data";
      this.displayToastMessage(error_msg);
    }
  };

  displayToastMessage = async (msg) => {
    setTimeout(() => {
      Toast.show(msg);
    }, 300);
  };

  static navigationOptions = { headerShown: false };

  componentDidMount = async () => {
    this.get_local_zc_accounts();
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.get_local_zc_accounts();
      }
    );
  };

  componentWillUnmount() {
    //console.log("componentWillUnmount");
    this.willFocusSubscription.remove();
  }

  delete_record = async (account_id) => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        this.delete_record_live(account_id);
      } else {
        let error = "Please connect with internet for remove this account.";
        this.displayToastMessage(error);
      }
    });
  };

  delete_record_live = async (account_id) => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
      account_id: account_id,
    };
    let response = await ApiController.post("delete_under_accounts", params);
    if (response.success == 1) {
      this.get_local_zc_accounts();
    } else {
      let error_msg = "something goes wrong to delete data";
      this.displayToastMessage(error_msg);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Loader loading={this.state.loading} />

        <View style={styles.header}>
          <Text style={styles.headertitle}>Notifications</Text>
          <View></View>
        </View>

        <ScrollView>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              style={styles.logo}
              source={require("../../images/logo.png")}
            />
            <Text style={{ fontWeight: "bold" }}>
              {this.state.election_name}
            </Text>
          </View>

          {this.state.zc_accounts_html}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={() => {
              this.props.navigation.navigate("Intro");
            }}
            contentStyle={{ backgroundColor: "#0b353c", height: 50 }}
            icon="chevron-left"
            mode="contained"
          >
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
    backgroundColor: "#f5f5f5",
  },
  logo: { width: 150, height: 80 },
  footer: {
    backgroundColor: "rgba(255,255,255,0.4)",
    padding: 10,
    elevation: 0.9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    padding: 15,
    flexDirection: "row",
    height: 60,
    alignItems: "center",
    shadowColor: "#929292",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
  },
  headertitle: {
    fontSize: 20,
    color: "#515C6F",
    marginLeft: 15,
    flex: 1,
  },

  textbold: {
    color: "#515C6F",
    fontWeight: "bold",
  },
  textnormal: {
    color: "#515C6F",
    fontSize: 14,
  },
  notilist: {
    padding: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 5,
    borderRadius: 5,
    shadowColor: "#cecece",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
  },
  textsmall: {
    fontSize: 12,
    color: "#aaa",
  },
  unread: {
    backgroundColor: "#eee",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  noti: {
    width: 20,
    height: 20,
    position: "absolute",
    backgroundColor: "#f33d79",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
    top: -5,
    right: -5,
  },
});
