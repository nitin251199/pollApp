import React, { Component } from "react";
import {
  Text,
  View,
  Image,
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
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default class Zone extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      question_data: null,
      election_name: "",
      questions_html: [],
      active_index: 0,
      total_questions: null,
      question_area_display: true,
      upload_area_display: false,
      name: "",
      mobile: "",
      photo: "",
      latitude: null,
      longtitude: null,
      lat_long_str: "",
      photo_img: null,
      internet_connected: true,
      zone_list_html: [],
      zone_id: "",
    };
  }

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

  displayToastMessage = async (msg) => {
    setTimeout(() => {
      Toast.show(msg);
    }, 300);
  };

  static navigationOptions = { headerShown: false };

  componentDidMount = async () => {
    this.checkInternet();
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.checkInternet();
      }
    );
  };

  componentWillUnmount() {
    //console.log("componentWillUnmount");
    this.willFocusSubscription.remove();
  }

  get_data_from_live = async () => {
    if (this.state.internet_connected == true) {
      let zone_id = this.state.zone_id;
      if (zone_id != "" && zone_id != null) {
        this.get_question();
      } else {
        let error_msg = "Please select zone before save.";
        this.displayToastMessage(error_msg);
      }
    } else {
      let error_msg =
        "Internet is not connected with device, please connect internet and come again on this screen.";
      this.displayToastMessage(error_msg);
    }
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
      // console.log("hahahahahahahahhahaa//",zone_list_html);
    } else {
      let error_msg = response.error_msg;
      this.displayToastMessage(error_msg);
    }
  };

  setZoneId = async (zone_id) => {
    this.setState({ zone_id: zone_id });
  };

  get_question = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
      zone_id: this.state.zone_id,
    };
    this.setState({ loading: true });
    let response = await ApiController.post("render_questions_zone", params);
    this.setState({ loading: false });
    //console.log(response);
    if (response.success == 1) {
      await AsyncStorage.removeItem("poll_questions_data");
      await AsyncStorage.removeItem("user_zone_data");

      await LocalDB.saveAllQuestionsData(response.data);
      await LocalDB.saveUserZoneData(response.data.zone_data);
      let error_msg =
        "Zone data is synced from live, you can use App now for survey.";
      this.displayToastMessage(error_msg);
      this.props.navigation.navigate("Intro");
    } else {
      let error_msg = response.error_msg;
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

          <View
            style={{
              margin: 15,
              padding: 10,
              backgroundColor: "white",
              borderRadius: 5,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 15, color: "black", fontWeight: "bold" }}>
              Please select Zone (विधानसभा क्षेत्र ) to change App data, and
              press "Save Zone" button.
            </Text>
          </View>

          <View
            style={{
              margin: 15,
              padding: 10,
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
            Cancel
          </Button>
          <Button
            onPress={() => {
              this.get_data_from_live();
            }}
            contentStyle={{
              flexDirection: "row-reverse",
              backgroundColor: "#25904f",
              height: 50,
            }}
            icon="chevron-right"
            mode="contained"
          >
            SAVE ZONE
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
