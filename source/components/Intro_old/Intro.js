import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  Animated,
  ImageBackground,
  StyleSheet,
  ScrollView,
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
  TextInput,
} from "react-native-paper";
import ApiController from "../../ApiController/ApiController";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Animatable from "react-native-animatable";
import Toast from "react-native-simple-toast";
import LocalDB from "../../LocalDB/LocalDB";
import NetInfo from "@react-native-community/netinfo";

export default class Splash extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      total_sample: "",
      total_pending: "",
    };
  }
  static navigationOptions = { headerShown: false };

  componentWillUnmount() {
    //console.log("componentWillUnmount");
    this.willFocusSubscription.remove();
  }

  displayToastMessage = async (msg) => {
    setTimeout(() => {
      Toast.show(msg);
    }, 300);
  };

  componentDidMount = async () => {
    this.get_uploaded_sample();
    this.get_local_question();
    this.get_local_zones();
    this.get_local_candidates();
    this.get_pending_sync();
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.checkInternet();
        this.get_uploaded_sample();
        this.get_pending_sync();
      }
    );
  };

  sync_local_to_server = async () => {
    let poll_data = await LocalDB.getSurvayData();
    for (let i = 0; i < poll_data.length; i++) {
      this.save_data_server(poll_data[i]);
    }
    this.remove_pending_local_data();
    let success_msg = "Data sync to server successfully!";
    this.displayToastMessage(success_msg);
  };

  remove_pending_local_data = async () => {
    try {
      const data = await AsyncStorage.removeItem("poll_data");
    } catch (error) {}
  };

  save_data_server = async (passed_param) => {
    let userDetail = await LocalDB.getUserProfile();
    let params = passed_param;
    await ApiController.post("save_data", params);
  };

  checkInternet = async () => {
    let upladed_data = await LocalDB.get_uploaded_sample();
    // For Android devices
    NetInfo.fetch().then((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (state.isConnected == true) {
        this.get_uploaded_sample();
        this.setState({
          internet_connected: true,
        });
      } else {
        let uploaded = "";
        if (upladed_data != null) {
          uploaded = upladed_data.count;
        }

        this.setState({
          internet_connected: false,
          total_sample: uploaded,
        });
      }
    });
  };

  get_uploaded_sample = async () => {
    let userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
    };
    //console.log('total_uploaded_survay',params);
    let response = await ApiController.post("total_uploaded_survay", params);
    if (response.success == 1) {
      let uploaded_sample_data = { count: response.data };
      await LocalDB.save_uploaded_sample(uploaded_sample_data);
      this.setState({
        total_sample: response.data,
      });
    }
  };

  get_pending_sync = async () => {
    let poll_data = await LocalDB.getSurvayData();
    //console.log(poll_data);
    let poll_pending = "0";
    if (poll_data != null) {
      poll_pending = poll_data.length;
    }
    this.setState({
      total_pending: poll_pending,
    });
  };

  get_local_candidates = async () => {
    var candidate_data = await LocalDB.getAllCandidateData();
    if (candidate_data !== null) {
    } else {
      this.get_candidates();
    }
  };

  get_candidates = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
    };
    let response = await ApiController.post("get_candidates", params);
    if (response.success == 1) {
      await LocalDB.saveCandidateData(response.data);
    } else {
      let error_msg = response.error_msg;
      this.displayToastMessage(error_msg);
    }
  };

  get_local_zones = async () => {
    var zone_data = await LocalDB.getAllZoneData();
    if (zone_data !== null) {
      //console.log('zone_data',zone_data);
      this.setState({
        zone_data: zone_data,
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
    } else {
      let error_msg = response.error_msg;
      this.displayToastMessage(error_msg);
    }
  };

  get_local_question = async () => {
    var question_data = await LocalDB.getAllQuestionsData();
    if (question_data !== null) {
      //  console.log('question_data',question_data);
      this.setState({
        questions_data: question_data,
      });
    } else {
      this.get_question();
    }
  };

  get_question = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
    };
    //console.log('question_param',params);
    this.setState({ loading: true });
    let response = await ApiController.post("render_questions", params);
    this.setState({ loading: false });
    //console.log(response);
    if (response.success == 1) {
      await LocalDB.saveAllQuestionsData(response.data);
    } else {
      let error_msg = response.error_msg;
      this.displayToastMessage(error_msg);
    }
  };

  sync_data_from_live = async () => {
    try {
      await AsyncStorage.removeItem("poll_questions_data");
      await AsyncStorage.removeItem("candidate_data");
      await AsyncStorage.removeItem("zones_data");

      this.get_local_question();
      this.get_local_zones();
      this.get_local_candidates();

      let error_msg = "App is ready to use again !";
      this.displayToastMessage(error_msg);
    } catch (error) {}
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 20, flex: 1 }}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              style={styles.logo}
              source={require("../../images/logo.png")}
            />
            <View
              style={{
                backgroundColor: "#0b353c",
                borderRadius: 5,
                height: 100,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 50,
                marginTop: 50,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 20, color: "#fff" }}>
                Insterted Records:{" "}
                <Text style={{ color: "red" }}>{this.state.total_sample}</Text>
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Button
              contentStyle={{
                flexDirection: "row-reverse",
                backgroundColor: "#25904f",
                height: 55,
              }}
              mode="contained"
              onPress={() => {
                this.props.navigation.navigate("Zone");
              }}
            >
              <Title style={{ color: "#fff" }}> नया सैंपल </Title>
            </Button>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Button
              contentStyle={{
                flexDirection: "row-reverse",
                backgroundColor: "#0b353c",
                height: 55,
              }}
              mode="contained"
              onPress={() => {
                this.sync_local_to_server();
              }}
            >
              <Title style={{ color: "#fff" }}>
                {" "}
                अपलोड करें - Pending-{this.state.total_pending}{" "}
              </Title>
            </Button>
          </View>

          <View style={{ marginBottom: 45 }}>
            <Button
              contentStyle={{
                flexDirection: "row-reverse",
                backgroundColor: "#f52754",
                height: 55,
              }}
              mode="contained"
              onPress={() => {
                this.sync_data_from_live();
              }}
            >
              <Title style={{ color: "#fff" }}> Sync Data With Live </Title>
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logo: { width: 150, height: 80, marginTop: 15 },

  header: {
    backgroundColor: "#099943",
  },
});
