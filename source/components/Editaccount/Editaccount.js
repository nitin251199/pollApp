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

export default class Editaccount extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      id: null,
      name: "",
      phone: "",
      member_role: null,
      mem_id: null,
      zone_list_html: [],
      zone_id: "",
    };
  }

  save_account_data = async () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        this.save_account();
      } else {
        let error_msg = "Please connect with internet to create account.";
        this.displayToastMessage(error_msg);
      }
    });
  };

  save_account = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      id: this.state.id,
      mem_id: userDetail.mem_id,
      member_role: userDetail.member_role,
      name: this.state.name,
      phone_number: this.state.phone_number,
      zone_id: this.state.zone_id,
    };
    let response = await ApiController.post("create_under_accounts", params);
    if (response.success == 1) {
      this.props.navigation.navigate("Members");
      let error_msg = "Account created successfully!";
      this.displayToastMessage(error_msg);
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
  componentWillUnmount() {
    //console.log("componentWillUnmount");
    this.willFocusSubscription.remove();
  }

  componentDidMount = async () => {
    const { params } = this.props.navigation.state;
    let member_data = params.member_data;

    this.setState({
      id: member_data.mem_id,
      name: member_data.name,
      phone: member_data.phone_number,
      zone_id: member_data.zone_id,
    });

    this.checkInternet();
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.checkInternet();
      }
    );
    var userDetail = await LocalDB.getUserProfile();
    this.setState({
      mem_id: userDetail.mem_id,
      member_role: userDetail.member_role,
    });
  };

  checkInternet = async () => {
    NetInfo.fetch().then((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (state.isConnected == true) {
        this.get_local_zones();
        this.setState({
          internet_connected: true,
        });
      } else {
        this.setState({
          internet_connected: false,
        });
      }
    });
  };

  get_local_zones = async () => {
    var zone_data = await LocalDB.getAllZoneData();
    if (zone_data !== null) {
      let zone_list_arr = [];
      for (let i = 0; i < zone_data.length; i++) {
        let obj = {
          label: zone_data[i].name,
          value: zone_data[i].id,
          color: "#000000",
        };
        zone_list_arr.push(obj);
      }
      this.setState({
        zone_list_html: zone_list_arr,
      });
    } else {
      this.get_zones();
    }
  };

  get_zones = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
    };
    let response = await ApiController.post("get_zones", params);
    //console.log(response);
    if (response.success == 1) {
      await LocalDB.saveAllZoneData(response.data);
      let zone_data = response.data;
      let zone_list_arr = [];
      for (let i = 0; i < zone_data.length; i++) {
        let obj = {
          label: zone_data[i].name,
          value: zone_data[i].id,
          color: "#000000",
        };
        zone_list_arr.push(obj);
      }
      this.setState({
        zone_list_html: zone_list_arr,
      });
    } else {
      let error_msg = response.error_msg;
      this.displayToastMessage(error_msg);
    }
  };

  save_account_data = async () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        this.save_account_live();
      } else {
        let error = "Please connect with internet to create account.";
        this.displayToastMessage(error);
      }
    });
  };

  save_account_live = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      id: this.state.id,
      mem_id: userDetail.mem_id,
      member_role: userDetail.member_role,
      name: this.state.name,
      phone: this.state.phone,
      zone_id: this.state.zone_id,
    };

    console.log(params);
    let response = await ApiController.post("edit_under_accounts", params);
    if (response.success == 1) {
      this.props.navigation.navigate("Members");
      let error_msg = "Account updated successfully.";
      this.displayToastMessage(error_msg);
    } else {
      let error_msg = "something goes wrong to delete data";
      this.displayToastMessage(error_msg);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Loader loading={this.state.loading} />

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

          {this.state.internet_connected == false ? (
            <View
              style={{
                margin: 15,
                padding: 10,
                backgroundColor: "white",
                borderRadius: 5,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 18, color: "red", fontWeight: "bold" }}>
                Please check your internet settings , you are not connected with
                internet, please connect internet and come on thid screen again.
              </Text>
            </View>
          ) : null}

          <View style={{ paddingHorizontal: 20, flex: 1 }}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              {this.state.member_role == "QC" ? (
                <Text>Create Z.C. Account </Text>
              ) : (
                <Text>Create O.T. Account </Text>
              )}
            </View>

            <View
              style={{
                margin: 10,
                backgroundColor: "white",
                borderRadius: 5,
                elevation: 2,
              }}
            >
              <RNPickerSelect
                placeholder={{
                  label: "Select Zone",
                  value: null,
                  color: "gray",
                }}
                ref="1"
                returnKeyType="done"
                value={this.state.zone_id}
                onValueChange={(zone_id) => {
                  this.setState({ zone_id: zone_id });
                }}
                style={pickerSelectStyles}
                items={this.state.zone_list_html}
              />
            </View>

            <View style={{ marginBottom: 15 }}>
              <TextInput
                label="Name"
                placeholder="Enter Name"
                mode="outlined"
                value={this.state.name}
                onChangeText={(name) => this.setState({ name: name })}
                style={{ backgroundColor: "#fff" }}
                theme={{ colors: { primary: "#25904f" } }}
              />
            </View>

            <View style={{ marginBottom: 15 }}>
              <TextInput
                label="Mobile"
                placeholder="Enter Mobile Number"
                mode="outlined"
                keyboardType="numeric"
                maxLength={10}
                maxLength={10}
                value={this.state.phone}
                onChangeText={(phone) => this.setState({ phone: phone })}
                style={{ backgroundColor: "#fff" }}
                theme={{ colors: { primary: "#25904f" } }}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={() => {
              this.props.navigation.navigate("Members");
            }}
            contentStyle={{ backgroundColor: "#0b353c", height: 50 }}
            icon="chevron-left"
            mode="contained"
          >
            BACK
          </Button>
          <Button
            onPress={() => {
              this.save_account_data();
            }}
            contentStyle={{
              flexDirection: "row-reverse",
              backgroundColor: "#25904f",
              height: 50,
            }}
            icon="chevron-right"
            mode="contained"
          >
            SAVE ACCOUNT
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
    backgroundColor: "#f5f5f5",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    padding: 10,
  },
  card_display: {
    margin: 15,
  },
  card_none: {
    margin: 15,
    display: "none",
  },

  footer: {
    backgroundColor: "rgba(255,255,255,0.4)",
    padding: 10,
    elevation: 0.9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    backgroundColor: "#099943",
  },
  radiolist: {
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  linebox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  smile: {
    marginTop: 30,
    marginBottom: 5,
    height: 50,
    width: 50,
  },
  smile_selected: {
    marginTop: 30,
    marginBottom: 5,
    height: 50,
    width: 50,
    borderColor: "green",
    borderWidth: 1,
  },
  mojilist: {
    alignItems: "center",
  },
  boxstyle: {
    flexDirection: "row",
  },
  boxstyle_full: {
    flex: 1,
  },
  mainbox: {
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    marginBottom: 10,
  },
  pagetitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  boxtitle: {
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    fontSize: 15,
    padding: 10,
    lineHeight: 20,
  },
  radiolist_half: {
    flex: 1,
  },
});
