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
  Alert,
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
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      user_zone_data: null,
      survey_ready: false,
      member_role: "OT",
      zc_count: null,
      zc_accounts: null,
      new_count: 0,
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
    this.check_user_type();
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        this.check_user_type();
      }
    );
  };

  check_user_type = async () => {
    let user_profile = await LocalDB.getUserProfile();
    if (user_profile != null) {
      this.setState({ member_role: user_profile.member_role });
      if (user_profile.member_role == "OT") {
        this.checkInternet();
        this.get_pending_sync();
        this.check_zone_data();
      }

      if (
        user_profile.member_role == "QC" ||
        user_profile.member_role == "ZC"
      ) {
        this.checkInternet();
        this.get_local_zc_accounts();
      }

      console.log("user_profile", user_profile);
    }
  };

  try_sync_data_server = async () => {
    let upladed_data = await LocalDB.get_uploaded_sample();

    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        this.sync_local_to_server();
      } else {
        let error_msg =
          "Please connect your device with internet and try again.";
        this.displayToastMessage(error_msg);
      }
    });
  };

  sync_local_to_server = async () => {
    let userDetail = await LocalDB.getUserProfile();
    let poll_data = await LocalDB.getSurvayData();
    console.log("poll_data", poll_data);
    let to_remove_index = [];
    for (let i = 0; i < poll_data.length; i++) {
      let questions = poll_data[i].survey_data.questions;
      let answer_data = [];
      for (let k = 0; k < questions.length; k++) {
        if (
          questions[k].question_type == "normal" ||
          questions[k].question_type == "rating" ||
          questions[k].question_type == "multi_choice" ||
          questions[k].question_type == "single_choice" ||
          questions[k].question_type == "dynamic_choice"
        ) {
          let survey_data_obj = {
            election_id: questions[k].question_id,
            ot_id: userDetail.mem_id,
            question_id: questions[k].id,
            option_id: questions[k].selected_option_id,
          };
          answer_data.push(survey_data_obj);
        }

        if (questions[k].question_type == "multiple") {
          let child_questions = questions[k].child_questions;
          for (let l = 0; l < child_questions.length; l++) {
            let survey_data_obj = {
              election_id: child_questions[l].question_id,
              ot_id: userDetail.mem_id,
              question_id: child_questions[l].id,
              option_id: child_questions[l].selected_option_id,
            };
            answer_data.push(survey_data_obj);
          }
        }
      }

      let survey_data = JSON.stringify(answer_data);

      let params = {
        name: poll_data[i].name,
        mobile: poll_data[i].mobile,
        photo: poll_data[i].photo,
        latitude: poll_data[i].latitude,
        longtitude: poll_data[i].longtitude,
        zone_id: poll_data[i].zone_id,
        survey_data: survey_data,
        mem_id: userDetail.mem_id,
      };

      let response = await ApiController.post("save_data", params);
      if (response.success == 1) {
        to_remove_index.push(i);
      }
    }

    if (to_remove_index.length == poll_data.length) {
      this.remove_pending_local_data();
      let success_msg = "Data sync to server successfully!";
      this.displayToastMessage(success_msg);
    } else {
      if (to_remove_index.length > 0) {
        for (let j = 0; j < to_remove_index.length; j++) {
          poll_data.splice(to_remove_index[j]);
        }
        await AsyncStorage.removeItem("poll_data");
        await LocalDB.saveSurvayData(poll_data);
        let success_msg = "Something goes wrong in sync data, please try again";
        this.displayToastMessage(success_msg);
      }
    }
  };

  remove_pending_local_data = async () => {
    try {
      const data = await AsyncStorage.removeItem("poll_data");
      this.get_pending_sync();
    } catch (error) {}
  };

  save_data_server = async (passed_param) => {
    let userDetail = await LocalDB.getUserProfile();
    let params = passed_param;
    let response = await ApiController.post("save_data", params);
  };

  checkInternet = async () => {
    let upladed_data = await LocalDB.get_uploaded_sample();
    // For Android devices
    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        this.check_notifications();
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

  check_notifications = async () => {
    var userDetail = await LocalDB.getUserProfile();

    let notifications = await LocalDB.getNotifications();
    let notifications_count = 0;
    if (notifications != null) {
      notifications_count = notifications.length;
    }
    let params = {
      mem_id: userDetail.mem_id,
    };
    let response = await ApiController.post("get_notifications", params);
    console.log("get_notifications", response);
    if (response.success == 1) {
      let live_notification_count = response.data.length;
      let new_count = 0;
      if (live_notification_count > notifications_count) {
        new_count = live_notification_count - notifications_count;
        this.setState({
          new_count: new_count,
        });
      }
    }
  };

  get_uploaded_sample = async () => {
    let userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
      member_role: userDetail.member_role,
    };
    console.log("total_uploaded_survay", params);
    let response = await ApiController.post("total_uploaded_survay", params);
    console.log("total_uploaded_survay", params);
    if (response.success == 1) {
      let uploaded_sample_data = { count: response.data };
      await LocalDB.save_uploaded_sample(uploaded_sample_data);
      this.setState({
        total_sample: response.data,
      });
    }
  };

  check_zone_data = async () => {
    var user_zone_data = await LocalDB.getUserZoneData();
    if (user_zone_data !== null) {
      this.setState({
        user_zone_data: user_zone_data,
        survey_ready: true,
      });
    } else {
      var userDetail = await LocalDB.getUserProfile();
      this.refresh_question_zone_data(userDetail);
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

  app_not_ready = async () => {
    let error_msg = "Please setup zone before start survey!";
    this.displayToastMessage(error_msg);
  };

  logout = async () => {
    await AsyncStorage.removeItem("user_zone_data");
    await AsyncStorage.removeItem("zones_data");
    await AsyncStorage.removeItem("poll_data_uploaded");
    await AsyncStorage.removeItem("poll_data");
    await AsyncStorage.removeItem("poll_profile");
    await AsyncStorage.removeItem("poll_questions_data");
    let error_msg = "Logout successfully!";
    this.displayToastMessage(error_msg);
    this.props.navigation.navigate("MainScreen");
  };

  get_local_zc_accounts = async () => {
    let zc_accounts = await LocalDB.getZcAccounts();

    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        this.get_zc_accounts();
      } else {
        let zc_count = 0;
        if (zc_accounts != null) {
          zc_count = zc_accounts.length;
        }

        this.setState({
          zc_accounts: zc_accounts,
          zc_count: zc_count,
        });
      }
    });
  };

  get_zc_accounts = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
      member_role: userDetail.member_role,
    };
    let response = await ApiController.post("get_under_accounts", params);
    if (response.success == 1) {
      await AsyncStorage.removeItem("zv_accounts_data");
      await LocalDB.saveZcAccounts(response.data);
      this.setState({
        zc_accounts: response.data,
        zc_count: response.data.length,
      });
    } else {
      let error_msg = "something goes wrong to get data";
      this.displayToastMessage(error_msg);
    }
  };

  zone_change_error = async () => {
    let error_msg =
      "Zone is already set, you can not change zone, please ask to ZC to change your zone.";
    this.displayToastMessage(error_msg);
  };

  set_zone = async () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        this.get_user_profile();
      } else {
        let error_msg = "Please connect your device with internet to set Zone";
        this.displayToastMessage(error_msg);
      }
    });
  };

  get_user_profile = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let params = {
      mem_id: userDetail.mem_id,
    };
    let response = await ApiController.post("get_user_profile", params);
    if (response.success == 1) {
      await AsyncStorage.removeItem("poll_profile");
      let user_data = {
        mem_id: response.data.mem_id,
        parent_id: response.data.parent_id,
        zone_id: response.data.zone_id,
        member_role: response.data.member_role,
        name: response.data.name,
        phone_number: response.data.phone_number,
      };
      await LocalDB.saveProfile(user_data);
      this.refresh_question_zone_data(user_data);
    } else {
      let error_msg = "something goes wrong to get data";
      this.displayToastMessage(error_msg);
    }
  };

  refresh_question_zone_data = async (user_data) => {
    let params = {
      mem_id: user_data.mem_id,
      zone_id: user_data.zone_id,
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
      this.check_zone_data();
    } else {
      let error_msg = response.error_msg;
      this.displayToastMessage(error_msg);
    }
  };

  alert_for_refresh = async () => {
    Alert.alert(
      "Re-fresh Zone and Data ",
      "Are you sure, You want to re-fresh zone and other data from live?",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("cancel pressed");
          },
          style: "cancel",
        },
        {
          text: "Yes, I am sure",
          onPress: () => {
            this.set_zone();
          },
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          console.log("cancel pressed");
        },
      }
    );
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

          {this.state.member_role == "OT" ? (
            <>
              {this.state.survey_ready == true ? (
                <View style={{ marginBottom: 15 }}>
                  <Button
                    contentStyle={{
                      flexDirection: "row-reverse",
                      backgroundColor: "#25904f",
                      height: 55,
                    }}
                    mode="contained"
                    onPress={() => {
                      this.props.navigation.navigate("Question");
                    }}
                  >
                    <Title style={{ color: "#fff" }}> नया सैंपल </Title>
                  </Button>
                </View>
              ) : (
                <View style={{ marginBottom: 15 }}>
                  <Button
                    contentStyle={{
                      flexDirection: "row-reverse",
                      backgroundColor: "#aba8a7",
                      height: 55,
                    }}
                    mode="contained"
                    onPress={() => {
                      this.app_not_ready();
                    }}
                  >
                    <Title style={{ color: "#fff" }}>
                      {" "}
                      नया सैंपल (Not Ready){" "}
                    </Title>
                  </Button>
                </View>
              )}

              <View style={{ marginBottom: 15 }}>
                <Button
                  contentStyle={{
                    flexDirection: "row-reverse",
                    backgroundColor: "#0b353c",
                    height: 55,
                  }}
                  mode="contained"
                  onPress={() => {
                    this.try_sync_data_server();
                  }}
                >
                  <Title style={{ color: "#fff" }}>
                    {" "}
                    अपलोड करें - Pending-{this.state.total_pending}{" "}
                  </Title>
                </Button>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Button
                  contentStyle={{
                    flexDirection: "row-reverse",
                    backgroundColor: "#1e71f7",
                    height: 55,
                  }}
                  mode="contained"
                  onPress={() => {
                    this.props.navigation.navigate("Pendinglist");
                  }}
                >
                  <Title style={{ color: "#fff" }}>
                    {" "}
                    Review Pending survey -{this.state.total_pending}{" "}
                  </Title>
                </Button>
              </View>

              {this.state.survey_ready == true ? (
                <View style={{ marginBottom: 15 }}>
                  <Button
                    contentStyle={{
                      flexDirection: "row-reverse",
                      backgroundColor: "#f52754",
                      height: 55,
                    }}
                    onPress={() => {
                      this.alert_for_refresh();
                    }}
                  >
                    <Title style={{ color: "#fff" }}>
                      Zone: {this.state.user_zone_data.name} ({" "}
                      {this.state.user_zone_data.code} )
                    </Title>
                  </Button>
                </View>
              ) : (
                <View style={{ marginBottom: 15 }}>
                  <Button
                    contentStyle={{
                      flexDirection: "row-reverse",
                      backgroundColor: "#f52754",
                      height: 55,
                    }}
                    onPress={() => {
                      this.alert_for_refresh();
                    }}
                  >
                    <Title style={{ color: "#fff" }}> </Title>
                  </Button>
                </View>
              )}
            </>
          ) : null}

          {this.state.member_role == "QC" || this.state.member_role == "ZC" ? (
            <>
              <View style={{ marginBottom: 15 }}>
                <Button
                  contentStyle={{
                    flexDirection: "row-reverse",
                    backgroundColor: "#25904f",
                    height: 55,
                  }}
                  mode="contained"
                  onPress={() => {
                    this.props.navigation.navigate("Members");
                  }}
                >
                  {this.state.member_role == "QC" ? (
                    <Title style={{ color: "#fff" }}>
                      {" "}
                      Z.C. Accounts : {this.state.zc_count}{" "}
                    </Title>
                  ) : (
                    <Title style={{ color: "#fff" }}>
                      {" "}
                      O.T. Accounts : {this.state.zc_count}{" "}
                    </Title>
                  )}
                </Button>
              </View>
            </>
          ) : null}

          <View style={{ marginBottom: 45 }}>
            <Button
              contentStyle={{
                flexDirection: "row-reverse",
                backgroundColor: "red",
                height: 55,
              }}
              onPress={() => {
                this.logout();
              }}
            >
              <Title style={{ color: "#fff" }}>Logout </Title>
            </Button>
          </View>

          <View style={{ marginBottom: 45 }}>
            <Button
              contentStyle={{
                flexDirection: "row-reverse",
                backgroundColor: "#11024f",
                height: 55,
              }}
              onPress={() => {
                this.props.navigation.navigate("Notifications");
              }}
            >
              {this.state.new_count == 0 ? (
                <Title style={{ color: "#fff" }}>Notifications </Title>
              ) : (
                <Title style={{ color: "red" }}>
                  Notifications ({this.state.new_count}){" "}
                </Title>
              )}
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
