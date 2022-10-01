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
} from "react-native-paper";
import ApiController from "../../ApiController/ApiController";
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

export default class Question extends Component<Props> {
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
      image_path: null,
      internet_connected: true,
      zone_list_html: [],
      zone_id: "",
    };
  }

  checkLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message:
            "This App needs access to your location " +
            "so we can know where you are.",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getUserLocation();
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  checkInternet = async () => {
    let upladed_data = await LocalDB.get_uploaded_sample();

    NetInfo.fetch().then((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (state.isConnected == true) {
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

  getUserLocation = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        let lat_long_str =
          position.coords.latitude + "," + position.coords.longitude;
        this.setState({
          latitude: position.coords.latitude,
          longtitude: position.coords.longitude,
          lat_long_str: lat_long_str,
        });
        let error_msg = "Location updated successfully!";
        this.displayToastMessage(error_msg);
      },
      (error) => {
        let error_msg = "Please enable GPS on your device to get location.";
        this.displayToastMessage(error_msg);
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: false, timeout: 15000 }
    );
  };

  upload_image_camera = async () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
      includeExif: true,
      compressImageQuality: 0.7,
    }).then((image) => {
      this.save_image(image);
    });
  };

  upload_image_gallery = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
      includeExif: true,
    }).then((image) => {
      this.save_image(image);
    });
  };

  save_image = async (image_data) => {
    console.log("new_image_data", image_data);
    let photo_img = (
      <Image
        style={{ width: 350, height: 400, resizeMode: "contain" }}
        source={{ uri: image_data.path }}
      />
    );
    this.setState({
      photo_img: photo_img,
      photo: image_data.data,
      image_path: image_data.path,
    });
  };

  displayToastMessage = async (msg) => {
    setTimeout(() => {
      Toast.show(msg);
    }, 300);
  };

  static navigationOptions = { headerShown: false };

  componentDidMount = async () => {
    this.get_local_question();
    this.get_local_zones();
    //this.getUserLocation();
  };

  set_answer_obj = async (answer, question, i) => {
    let question_data = this.state.question_data;
    question_data.questions[i].selected_option_id = answer;
    this.re_render_question();
  };

  inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
      if (haystack[i] == needle) return true;
    }
    return false;
  }

  set_answer_obj_multiple = async (answer, question, i) => {
    let question_data = this.state.question_data;
    let pre_val = question_data.questions[i].selected_option_id;
    let new_selected_option_id = "";
    if (pre_val != "") {
      let pre_val_arr = pre_val.split(",");
      if (this.inArray(answer, pre_val_arr)) {
        var index_val = pre_val_arr.indexOf(answer);
        if (index_val !== -1) {
          pre_val_arr.splice(index_val, 1);
        }
      } else {
        pre_val_arr.push(answer);
      }

      for (let j = 0; j < pre_val_arr.length; j++) {
        if (j == 0) new_selected_option_id = pre_val_arr[j];
        else
          new_selected_option_id =
            new_selected_option_id + "," + pre_val_arr[j];
      }
    } else {
      new_selected_option_id = answer;
    }
    question_data.questions[i].selected_option_id = new_selected_option_id;
    this.re_render_question();
  };

  set_answer_inner_obj = async (answer, question, m, i) => {
    let question_data = this.state.question_data;
    question_data.questions[i].child_questions[m].selected_option_id = answer;
    this.re_render_question();
  };

  re_render_question = async () => {
    var question_data = this.state.question_data;

    let questions_html_arr = [];
    let c = 1;
    let q = 1;
    for (let i = 0; i < question_data.questions.length; i++) {
      let card_class = styles.card_none;
      if (i == this.state.active_index) card_class = styles.card_display;

      let question = question_data.questions[i];
      let question_title = "";
      if (question.question_prefix == "C") {
        question_title = "C-" + c + " : " + question.question;
        c++;
      } else {
        question_title = "Q-" + q + " : " + question.question;
        q++;
      }

      if (
        question.question_type == "normal" ||
        question.question_type == "dynamic_choice"
      ) {
        let options_html = [];
        let options = question.options;
        for (let j = 0; j < options.length; j++) {
          options_html.push(
            <RadioButton.Item
              value={options[j].id}
              style={styles.radiolist}
              label={options[j].option_title}
            />
          );
        }
        let radio_group = (
          <RadioButton.Group
            key={question.id}
            value={question.selected_option_id}
            onValueChange={(value) => {
              this.set_answer_obj(value, question, i);
            }}
          >
            {options_html}
          </RadioButton.Group>
        );

        questions_html_arr.push(
          <Card style={card_class} key={i}>
            <Title style={styles.cardHeader}>{question_title}</Title>
            <Card.Content>{radio_group}</Card.Content>
          </Card>
        );
      }

      if (question.question_type == "rating") {
        let options_html = [];
        let options = question.options;
        for (let j = 0; j < options.length; j++) {
          let mojiclass = styles.smile;
          if (options[j].id == question.selected_option_id)
            mojiclass = styles.smile_selected;

          options_html.push(
            <TouchableOpacity
              key={j}
              style={styles.mojilist}
              onPress={() => {
                this.set_answer_obj(options[j].id, question, i);
              }}
            >
              {options[j].option_emoji_id == 1 ? (
                <Image
                  style={mojiclass}
                  source={require("../../images/smile1.png")}
                />
              ) : null}

              {options[j].option_emoji_id == 2 ? (
                <Image
                  style={mojiclass}
                  source={require("../../images/smile2.png")}
                />
              ) : null}
              {options[j].option_emoji_id == 3 ? (
                <Image
                  style={mojiclass}
                  source={require("../../images/smile3.png")}
                />
              ) : null}
              {options[j].option_emoji_id == 4 ? (
                <Image
                  style={mojiclass}
                  source={require("../../images/smile4.png")}
                />
              ) : null}
              {options[j].option_emoji_id == 5 ? (
                <Image
                  style={mojiclass}
                  source={require("../../images/smile5.png")}
                />
              ) : null}

              <Text style={{ textAlign: "center" }}>
                {options[j].option_title}
              </Text>
            </TouchableOpacity>
          );
        }
        questions_html_arr.push(
          <Card style={card_class} key={i}>
            <Title style={styles.cardHeader}> {question_title} </Title>
            <Card.Content style={{ paddingHorizontal: 10 }}>
              <View style={styles.linebox}>{options_html}</View>
            </Card.Content>
          </Card>
        );
      }

      if (question.question_type == "multiple") {
        let child_questions = question.child_questions;
        let child_questions_html = [];
        for (let m = 0; m < child_questions.length; m++) {
          let options_html = [];
          let options = child_questions[m].options;

          for (let j = 0; j < options.length; j++) {
            let button_option_class = styles.button_option;
            let button_option_text_class = styles.button_option_text;
            if (options[j].id == child_questions[m].selected_option_id) {
              button_option_class = styles.button_option_active;
              button_option_text_class = styles.button_option_text_active;
            }

            options_html.push(
              <TouchableOpacity
                onPress={() => {
                  this.set_answer_inner_obj(
                    options[j].id,
                    child_questions[m],
                    m,
                    i
                  );
                }}
                style={button_option_class}
              >
                <Text style={button_option_text_class}>
                  {options[j].option_title}
                </Text>
              </TouchableOpacity>
              // <RadioButton.Item value={options[j].id}  style={styles.radiolist} label={options[j].option_title} />
            );
          }

          //let radio_group = <RadioButton.Group key={child_questions[m].id} value={child_questions[m].selected_option_id}  onValueChange={(value) => { this.set_answer_inner_obj(value,child_questions[m],m,i) }}   >{options_html}</RadioButton.Group>

          child_questions_html.push(
            <View style={{ marginBottom: 15 }}>
              <View style={{ alignItems: "center" }}>
                <Title style={styles.pagetitle}>
                  {child_questions[m].question}
                </Title>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  // justifyContent: "space-between",
                }}
              >
                {options_html}
              </View>
            </View>
          );
        }

        questions_html_arr.push(
          <Card style={card_class}>
            <Title style={styles.boxtitle}>{question_title}</Title>
            <Card.Content>{child_questions_html}</Card.Content>
          </Card>
        );
      }

      if (question.question_type == "multi_choice") {
        let options_html = [];
        let options = question.options;
        let selected_option_id = question.selected_option_id;
        let pre_selected_option_id_arr = [];
        if (selected_option_id != "") {
          pre_selected_option_id_arr = selected_option_id.split(",");
        }

        for (let j = 0; j < options.length; j++) {
          let option_status = "";
          if (this.inArray(options[j].id, pre_selected_option_id_arr))
            option_status = "checked";
          options_html.push(
            <Checkbox.Item
              status={option_status}
              label={options[j].option_title}
              onPress={() => {
                this.set_answer_obj_multiple(options[j].id, question, i);
              }}
            />
          );
        }
        questions_html_arr.push(
          <Card style={card_class} key={i}>
            <Title style={styles.cardHeader}>{question_title}</Title>
            <Card.Content>{options_html}</Card.Content>
          </Card>
        );
      }

      if (question.question_type == "single_choice") {
        let child_questions = question.child_questions;
        let child_questions_html = [];
        for (let m = 0; m < child_questions.length; m++) {
          let options_html = [];
          let options = child_questions[m].options;

          for (let j = 0; j < options.length; j++) {
            let button_option_class = styles.button_option;
            let button_option_text_class = styles.button_option_text;
            if (options[j].id == question.selected_option_id) {
              button_option_class = styles.button_option_active;
              button_option_text_class = styles.button_option_text_active;
            }

            options_html.push(
              <TouchableOpacity
                onPress={() => {
                  this.set_answer_obj(options[j].id, question, i);
                }}
                style={button_option_class}
              >
                <Text style={button_option_text_class}>
                  {options[j].option_title}
                </Text>
              </TouchableOpacity>
              //<RadioButton.Item value={options[j].id}  style={styles.radiolist} label={options[j].option_title} />
            );
          }

          child_questions_html.push(
            <View style={{ marginBottom: 15 }}>
              <View style={{ alignItems: "center" }}>
                <Title style={styles.pagetitle}>
                  {child_questions[m].question}
                </Title>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  display: "flex",
                  flex: 1,
                  flexWrap: "wrap",
                }}
              >
                {options_html}
              </View>
            </View>
          );
        }

        //let radio_group = <RadioButton.Group key={question.id} value={question.selected_option_id}  onValueChange={(value) => { this.set_answer_obj(value,question,i) }}   >{child_questions_html}</RadioButton.Group>

        questions_html_arr.push(
          <Card style={card_class}>
            <Title style={styles.boxtitle}>{question_title}</Title>
            <Card.Content>{child_questions_html}</Card.Content>
          </Card>
        );
      }
    }

    this.setState({
      question_data: question_data,
      election_name: question_data.election_data.election_name,
      questions_html: questions_html_arr,
    });
  };

  _renderButton = (text, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#ddd",
        position: "absolute",
        right: 10,
        top: 10,
        width: 30,
        height: 30,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99,
      }}
    >
      <View style={{}}>
        <Text style={{ color: "#999" }}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  get_local_question = async () => {
    var question_data = await LocalDB.getAllQuestionsData();
    if (question_data !== null) {
      let questions_html_arr = [];
      let c = 1;
      let q = 1;
      for (let i = 0; i < question_data.questions.length; i++) {
        let card_class = styles.card_none;
        if (i == this.state.active_index) card_class = styles.card_display;

        let question = question_data.questions[i];
        let question_title = "";
        if (question.question_prefix == "C") {
          question_title = "C-" + c + " : " + question.question;
          c++;
        } else {
          question_title = "Q-" + q + " : " + question.question;
          q++;
        }

        if (
          question.question_type == "normal" ||
          question.question_type == "dynamic_choice"
        ) {
          let options_html = [];
          let options = question.options;
          for (let j = 0; j < options.length; j++) {
            options_html.push(
              <RadioButton.Item
                value={options[j].id}
                style={styles.radiolist}
                label={options[j].option_title}
              />
            );
          }
          let radio_group = (
            <RadioButton.Group
              key={question.id}
              value={question.selected_option_id}
              onValueChange={(value) => {
                this.set_answer_obj(value, question, i);
              }}
            >
              {options_html}
            </RadioButton.Group>
          );

          questions_html_arr.push(
            <Card style={card_class} key={i}>
              <Title style={styles.cardHeader}>{question_title}</Title>
              <Card.Content>{radio_group}</Card.Content>
            </Card>
          );
        }

        if (question.question_type == "rating") {
          let options_html = [];
          let options = question.options;
          for (let j = 0; j < options.length; j++) {
            let mojiclass = styles.smile;
            if (options[j].id == question.selected_option_id)
              mojiclass = styles.smile_selected;

            options_html.push(
              <TouchableOpacity
                key={j}
                style={styles.mojilist}
                onPress={() => {
                  this.set_answer_obj(options[j].id, question, i);
                }}
              >
                {options[j].option_emoji_id == 1 ? (
                  <Image
                    style={mojiclass}
                    source={require("../../images/smile1.png")}
                  />
                ) : null}

                {options[j].option_emoji_id == 2 ? (
                  <Image
                    style={mojiclass}
                    source={require("../../images/smile2.png")}
                  />
                ) : null}
                {options[j].option_emoji_id == 3 ? (
                  <Image
                    style={mojiclass}
                    source={require("../../images/smile3.png")}
                  />
                ) : null}
                {options[j].option_emoji_id == 4 ? (
                  <Image
                    style={mojiclass}
                    source={require("../../images/smile4.png")}
                  />
                ) : null}
                {options[j].option_emoji_id == 5 ? (
                  <Image
                    style={mojiclass}
                    source={require("../../images/smile5.png")}
                  />
                ) : null}

                <Text>{options[j].option_title}</Text>
              </TouchableOpacity>
            );
          }
          questions_html_arr.push(
            <Card style={card_class} key={i}>
              <Title style={styles.cardHeader}> {question_title} </Title>
              <Card.Content>
                <View style={styles.linebox}>{options_html}</View>
              </Card.Content>
            </Card>
          );
        }

        if (question.question_type == "multiple") {
          let child_questions = question.child_questions;
          let child_questions_html = [];
          for (let m = 0; m < child_questions.length; m++) {
            let options_html = [];
            let options = child_questions[m].options;

            for (let j = 0; j < options.length; j++) {
              let mojiclass = styles.smile;
              if (options[j].id == child_questions[m].selected_option_id)
                mojiclass = styles.smile_selected;
              options_html.push(
                // <RadioButton.Item value={options[j].id} label={options[j].option_title} />
                <TouchableOpacity
                  onPress={() => {
                    this.set_answer_inner_obj(
                      options[j].id,
                      child_questions[m],
                      m,
                      i
                    );
                  }}
                  style={styles.button_option}
                >
                  <Text style={styles.button_option_text}>
                    {options[j].option_title}
                  </Text>
                </TouchableOpacity>
                // <TouchableOpacity style={styles.button_option_active}><Text style={styles.button_option_text_active}>{options[j].option_title}</Text></TouchableOpacity>
              );
            }

            //let radio_group = <RadioButton.Group key={child_questions[m].id} value={child_questions[m].selected_option_id}  onValueChange={(value) => { this.set_answer_inner_obj(value,child_questions[m],m,i) }}>{options_html}</RadioButton.Group>

            child_questions_html.push(
              <View style={{ marginBottom: 15 }}>
                <View style={{ alignItems: "center" }}>
                  <Title style={styles.pagetitle}>
                    {child_questions[m].question}
                  </Title>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {options_html}
                </View>
              </View>
            );
          }

          questions_html_arr.push(
            <Card style={card_class}>
              <Title style={styles.boxtitle}>{question_title}</Title>
              <Card.Content>{child_questions_html}</Card.Content>
            </Card>
          );
        }

        if (question.question_type == "multi_choice") {
          let options_html = [];
          let options = question.options;
          for (let j = 0; j < options.length; j++) {
            options_html.push(
              <Checkbox.Item
                value={options[j].id}
                label={options[j].option_title}
                onPress={() => {
                  this.set_answer_obj_multiple(options[j].id, question, i);
                }}
              />
            );
          }
          questions_html_arr.push(
            <Card style={card_class} key={i}>
              <Title style={styles.cardHeader}>{question_title}</Title>
              <Card.Content>{options_html}</Card.Content>
            </Card>
          );
        }

        if (question.question_type == "single_choice") {
          let child_questions = question.child_questions;
          let child_questions_html = [];
          for (let m = 0; m < child_questions.length; m++) {
            let options_html = [];
            let options = child_questions[m].options;

            for (let j = 0; j < options.length; j++) {
              options_html.push(
                //<RadioButton.Item value={options[j].id}  style={styles.radiolist} label={options[j].option_title} />
                <TouchableOpacity
                  onPress={() => {
                    this.set_answer_obj(options[j].id, question, i);
                  }}
                  style={styles.button_option}
                >
                  <Text style={styles.button_option_text}>
                    {options[j].option_title}
                  </Text>
                </TouchableOpacity>
              );
            }

            child_questions_html.push(
              <View style={{ marginBottom: 15 }}>
                <View style={{ alignItems: "center" }}>
                  <Title style={styles.pagetitle}>
                    {child_questions[m].question}
                  </Title>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    display: "flex",
                    flex: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {options_html}
                </View>
              </View>
            );
          }

          //let radio_group = <RadioButton.Group key={question.id} value={question.selected_option_id}  onValueChange={(value) => { this.set_answer_obj(value,question,i) }}   >{child_questions_html}</RadioButton.Group>

          questions_html_arr.push(
            <Card style={card_class}>
              <Title style={styles.boxtitle}>{question_title}</Title>
              <Card.Content>{child_questions_html}</Card.Content>
            </Card>
          );
        }
      }

      this.setState({
        question_data: question_data,
        election_name: question_data.election_data.election_name,
        questions_html: questions_html_arr,
        total_questions: question_data.questions.length,
      });
    } else {
      this.props.navigation.replace("Intro"); //MainScreen
    }
  };

  get_local_zones = async () => {
    var zone_data = await LocalDB.getUserZoneData();
    if (zone_data !== null) {
      this.setState({
        zone_id: zone_data.id,
      });
    } else {
      let error_msg = "Please setup zone first before adding survey";
      this.displayToastMessage(error_msg);
      this.props.navigation.replace("Intro"); //MainScreen
    }
  };

  previous_question = async () => {
    let active_index = this.state.active_index;

    if (active_index > 0) {
      let new_active_index = active_index - 1;
      this.setState({
        active_index: new_active_index,
      });

      setTimeout(() => {
        this.re_render_question();
      }, 200);
    } else {
      this.props.navigation.navigate("Intro");
    }
  };

  next_question = async () => {
    let error_status = false;
    let active_index = this.state.active_index;
    let question_data = this.state.question_data;
    let question_type = question_data.questions[active_index].question_type;

    if (
      question_type == "normal" ||
      question_type == "rating" ||
      question_type == "single_choice" ||
      question_type == "dynamic_choice"
    ) {
      if (question_data.questions[active_index].selected_option_id == "")
        error_status = true;
    }

    if (question_type == "multiple") {
      let child_questions =
        question_data.questions[active_index].child_questions;
      for (let i = 0; i < child_questions.length; i++) {
        if (child_questions[i].selected_option_id == "") {
          error_status = true;
          break;
        }
      }
    }

    if (error_status == false) {
      let total_questions = this.state.total_questions;
      let check_count = total_questions - 1;
      if (active_index < check_count) {
        let new_active_index = active_index + 1;
        this.setState({
          active_index: new_active_index,
        });

        setTimeout(() => {
          this.re_render_question();
        }, 200);
      }
      if (active_index == check_count) {
        this.setState({
          question_area_display: false,
          upload_area_display: true,
        });
      }
    } else {
      let error_msg = "Please select answer before proceed";
      this.displayToastMessage(error_msg);
    }
  };

  back_from_last_screen = async () => {
    this.setState({
      question_area_display: true,
      upload_area_display: false,
    });
  };

  save_data = async () => {
    let internet_connected = this.state.internet_connected;

    if (internet_connected == true) {
      this.save_data_server();
    } else {
      this.save_data_local();
    }
  };

  save_data_local_old = async () => {
    let userDetail = await LocalDB.getUserProfile();
    let question_data = this.state.question_data;
    let questions = question_data.questions;
    let answer_data = [];
    for (let i = 0; i < questions.length; i++) {
      if (
        questions[i].question_type == "normal" ||
        questions[i].question_type == "rating" ||
        questions[i].question_type == "multi_choice" ||
        questions[i].question_type == "single_choice" ||
        questions[i].question_type == "dynamic_choice"
      ) {
        let survey_data_obj = {
          election_id: questions[i].question_id,
          ot_id: userDetail.mem_id,
          question_id: questions[i].id,
          option_id: questions[i].selected_option_id,
        };
        answer_data.push(survey_data_obj);
      }

      if (questions[i].question_type == "multiple") {
        let child_questions = questions[i].child_questions;
        for (let j = 0; j < child_questions.length; j++) {
          let survey_data_obj = {
            election_id: child_questions[j].question_id,
            ot_id: userDetail.mem_id,
            question_id: child_questions[j].id,
            option_id: child_questions[j].selected_option_id,
          };
          answer_data.push(survey_data_obj);
        }
      }
    }

    let survey_data = JSON.stringify(answer_data);
    let params = {
      name: this.state.name,
      mobile: this.state.mobile,
      photo: this.state.photo,
      latitude: this.state.latitude,
      longtitude: this.state.longtitude,
      zone_id: this.state.zone_id,
      survey_data: survey_data,
      mem_id: userDetail.mem_id,
    };

    let __SURVAY_DATA_LOCAL = [];

    let poll_data = await LocalDB.getSurvayData();
    if (poll_data != null) {
      for (let p = 0; p < poll_data.length; p++) {
        __SURVAY_DATA_LOCAL.push(poll_data[p]);
      }
      __SURVAY_DATA_LOCAL.push(params);
      await LocalDB.saveSurvayData(__SURVAY_DATA_LOCAL);
    } else {
      __SURVAY_DATA_LOCAL.push(params);
      await LocalDB.saveSurvayData(__SURVAY_DATA_LOCAL);
    }

    let success_msg = "Data saved local, please upload it when you are online";
    this.displayToastMessage(success_msg);
    this.props.navigation.navigate("Intro");
  };

  save_data_local = async () => {
    let userDetail = await LocalDB.getUserProfile();
    let question_data = this.state.question_data;
    let error_status = false;

    if (this.state.name == "" || this.state.name == null) error_status = true;

    if (this.state.mobile == "" || this.state.mobile == null)
      error_status = true;

    if (this.state.photo == "") error_status = true;

    if (error_status == false) {
      let local_date = new Date();
      let params = {
        name: this.state.name,
        mobile: this.state.mobile,
        photo: this.state.photo,
        image_path: this.state.image_path,
        latitude: this.state.latitude,
        longtitude: this.state.longtitude,
        zone_id: this.state.zone_id,
        survey_data: question_data,
        mem_id: userDetail.mem_id,
        local_date: local_date,
      };

      let __SURVAY_DATA_LOCAL = [];

      let poll_data = await LocalDB.getSurvayData();
      if (poll_data != null) {
        for (let p = 0; p < poll_data.length; p++) {
          __SURVAY_DATA_LOCAL.push(poll_data[p]);
        }
        __SURVAY_DATA_LOCAL.push(params);
        await LocalDB.saveSurvayData(__SURVAY_DATA_LOCAL);
      } else {
        __SURVAY_DATA_LOCAL.push(params);
        await LocalDB.saveSurvayData(__SURVAY_DATA_LOCAL);
      }

      let success_msg =
        "Data saved local, please upload it when you are online";
      this.displayToastMessage(success_msg);
      this.props.navigation.navigate("Intro");
    } else {
      let error_msg =
        "Please check did you enter name, mobile number and photo before submit .";
      this.displayToastMessage(error_msg);
    }
  };
  save_data_server = async () => {
    var userDetail = await LocalDB.getUserProfile();
    let question_data = this.state.question_data;
    let questions = question_data.questions;
    let answer_data = [];
    for (let i = 0; i < questions.length; i++) {
      if (
        questions[i].question_type == "normal" ||
        questions[i].question_type == "rating" ||
        questions[i].question_type == "multi_choice" ||
        questions[i].question_type == "single_choice" ||
        questions[i].question_type == "dynamic_choice"
      ) {
        let survey_data_obj = {
          election_id: questions[i].question_id,
          ot_id: userDetail.mem_id,
          question_id: questions[i].id,
          option_id: questions[i].selected_option_id,
        };
        answer_data.push(survey_data_obj);
      }

      if (questions[i].question_type == "multiple") {
        let child_questions = questions[i].child_questions;
        for (let j = 0; j < child_questions.length; j++) {
          let survey_data_obj = {
            election_id: child_questions[j].question_id,
            ot_id: userDetail.mem_id,
            question_id: child_questions[j].id,
            option_id: child_questions[j].selected_option_id,
          };
          answer_data.push(survey_data_obj);
        }
      }
    }

    let survey_data = JSON.stringify(answer_data);

    let error_arr = [];

    let local_date = new Date();
    let params = {
      name: this.state.name,
      mobile: this.state.mobile,
      photo: this.state.photo,
      latitude: this.state.latitude,
      longtitude: this.state.longtitude,
      zone_id: this.state.zone_id,
      survey_data: survey_data,
      mem_id: userDetail.mem_id,
      local_date: local_date,
    };

    if (this.state.name == "")
      error_arr.push("Name is required, please enter name");
    if (this.state.mobile == "")
      error_arr.push("Name is required, please enter name");
    if (this.state.zone_id == "")
      error_arr.push("Zone is required, please select zone");

    if (error_arr.length == 0) {
      this.setState({ loading: true });
      let response = await ApiController.post("save_data", params);
      this.setState({ loading: false });
      console.log(
        ".......................................................",
        response
      );
      if (response.success == 1) {
        let error_msg = "Survay data has been submitted successfully!";
        this.displayToastMessage(error_msg);
        this.props.navigation.navigate("Intro");
      } else {
        let error_msg = response.error_msg;
        this.displayToastMessage(error_msg);
      }
    } else {
      let error_msg = "Please select or enter All data before proceed";
      this.displayToastMessage(error_msg);
    }
  };

  setZoneId = async (zone_id) => {
    this.setState({ zone_id: zone_id });
  };

  save_all_survey_data_old = async () => {
    NetInfo.fetch().then((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (state.isConnected == true) {
        this.save_data_server();
      } else {
        this.save_data_local();
      }
    });
  };

  save_all_survey_data = async () => {
    this.save_data_local();
  };

  upload_image_option = async () => {
    Alert.alert(
      "Upload Image",
      "Please select from where you want to upload image?",
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("cancel pressed");
          },
          style: "cancel",
        },
        {
          text: "From Gallery",
          onPress: () => {
            this.upload_image_gallery();
          },
          style: "cancel",
        },
        {
          text: "From Camera",
          onPress: () => {
            this.upload_image_camera();
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
        <Loader loading={this.state.loading} />

        {this.state.question_area_display == true ? (
          <>
            <ScrollView>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Image
                  style={styles.logo}
                  source={require("../../images/logo.png")}
                />
                <Text style={{ fontWeight: "bold", color: "#000" }}>
                  {this.state.election_name}
                </Text>
              </View>

              {this.state.questions_html}
            </ScrollView>

            <View style={styles.footer}>
              <Button
                onPress={() => {
                  this.previous_question();
                }}
                contentStyle={{ backgroundColor: "#0b353c", height: 50 }}
                icon="chevron-left"
                mode="contained"
              >
                Prev
              </Button>
              <Button
                onPress={() => {
                  this.next_question();
                }}
                contentStyle={{
                  flexDirection: "row-reverse",
                  backgroundColor: "#25904f",
                  height: 50,
                }}
                icon="chevron-right"
                mode="contained"
              >
                Next
              </Button>
            </View>
          </>
        ) : null}
        {this.state.upload_area_display == true ? (
          <>
            <ScrollView>
              <View style={{ paddingHorizontal: 20, flex: 1 }}>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <Image
                    style={styles.logo}
                    source={require("../../images/logo.png")}
                  />
                  <Text style={{ fontWeight: "bold", color: "#000000" }}>
                    सर्वे :{" "}
                    <Text style={{ color: "#000000" }}>2022 - 2023</Text>
                  </Text>
                </View>

                <View style={{ marginBottom: 15 }}>
                  <TextInput
                    label="Email"
                    placeholder="Enter Name"
                    placeholderTextColor="#999"
                    mode="outlined"
                    value={this.state.name}
                    onChangeText={(name) => this.setState({ name: name })}
                    style={{ backgroundColor: "#fff", color: "#000000" }}
                  />
                </View>

                <View style={{ marginBottom: 15 }}>
                  <TextInput
                    label="Mobile"
                    placeholder="Enter Mobile Number"
                    mode="outlined"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={10}
                    value={this.state.mobile}
                    onChangeText={(mobile) => this.setState({ mobile: mobile })}
                    style={{ backgroundColor: "#fff", color: "#000000" }}
                  />
                </View>
                <View style={{ marginBottom: 15 }}>
                  <TextInput
                    label="Location"
                    placeholder="Geo Location"
                    placeholderTextColor="#999"
                    mode="outlined"
                    value={this.state.lat_long_str}
                    style={{ backgroundColor: "#fff", color: "#000000" }}
                  />
                </View>

                <View style={{ marginBottom: 15 }}>
                  <Button
                    theme={{ roundness: 0 }}
                    contentStyle={{
                      flexDirection: "row-reverse",
                      backgroundColor: "#c48404",
                      height: 55,
                    }}
                    icon="map"
                    mode="contained"
                    onPress={() => this.getUserLocation()}
                  >
                    GET CURRENT LOCATION
                  </Button>
                </View>

                <View style={{ marginBottom: 15 }}>
                  <Button
                    theme={{ roundness: 0 }}
                    contentStyle={{
                      flexDirection: "row-reverse",
                      backgroundColor: "#25904f",
                      height: 55,
                    }}
                    icon="camera-plus-outline"
                    mode="contained"
                    onPress={() => this.upload_image_option()}
                  >
                    व्यक्ति या घर की फोटो
                  </Button>
                </View>

                <View style={{ marginBottom: 15 }}>{this.state.photo_img}</View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                onPress={() => {
                  this.back_from_last_screen();
                }}
                contentStyle={{ backgroundColor: "#0b353c", height: 50 }}
                icon="chevron-left"
                mode="contained"
              >
                Prev
              </Button>
              <Button
                onPress={() => {
                  this.save_all_survey_data();
                }}
                contentStyle={{
                  flexDirection: "row-reverse",
                  backgroundColor: "#25904f",
                  height: 50,
                }}
                icon="check-all"
                mode="contained"
              >
                सेव करें
              </Button>
            </View>
          </>
        ) : null}
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  smile: {
    // marginTop: 30,
    marginBottom: 5,
    height: 50,
    width: 50,
  },
  smile_selected: {
    // marginTop: 30,
    marginBottom: 5,
    height: 50,
    width: 50,
    borderColor: "green",
    borderWidth: 1,
  },
  mojilist: {
    flexDirection: "row",
    marginTop: 30,
    alignItems: "center",
    justifyContent: "space-between",
    width: "70%",
    // backgroundColor: "blue",
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
  button_option_active: {
    padding: 10,
    margin: 5,
    backgroundColor: "#099943",
    borderRadius: 4,
  },
  button_option_text_active: {
    textAlign: "center",
    color: "#fff",
  },
  button_option: {
    padding: 10,
    margin: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button_option_text: {
    textAlign: "center",
    color: "#000000",
  },
});
