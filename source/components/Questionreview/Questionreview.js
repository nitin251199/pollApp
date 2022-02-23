import React, { Component } from 'react';
import { Text, View, Image,TextInput, Animated, ImageBackground, TouchableOpacity,StyleSheet, ScrollView,PermissionsAndroid,Platform } from 'react-native';
import { Card, Title, Checkbox, Button, DefaultTheme, Provider as PaperProvider, Appbar, RadioButton } from 'react-native-paper';
import ApiController from '../../ApiController/ApiController';
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



export default class Questionreview extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      question_data : null,
      election_name : '',
      questions_html : [],
      active_index : 0,
      total_questions : null,
      question_area_display : true,
      upload_area_display: false,
      name : '',
      mobile : '',
      photo : '',
      latitude : null,
      longtitude : null,
      lat_long_str : '',
      photo_img : null,
      internet_connected : true,
      zone_list_html : [],
      zone_id : ''
    }

  }




  displayToastMessage = async (msg) => {
    setTimeout(() => {
        Toast.show(msg);
    },300);
  }


  static navigationOptions = { headerShown: false };

  componentDidMount = async () => {
    this.re_render_question();
  
  }





  inArray(needle, haystack) {
      var length = haystack.length;
      for(var i = 0; i < length; i++) {
          if(haystack[i] == needle) return true;
      }
      return false;
  }







  re_render_question = async () => {

   
    const { params } = this.props.navigation.state;
    let poll_data = params.poll_data;

    let photo_img = <Image  style={{width: 350,height: 400,resizeMode:'contain'}}  source={{uri:poll_data.image_path}} />
    this.setState({
      photo_img : photo_img,
     
    })


    console.log('param_poll_data',poll_data);
      var question_data = poll_data.survey_data;
      
      let questions_html_arr = []; 
      let c = 1;
      let q = 1;
      for( let i=0; i<question_data.questions.length;i++ )
      {
          let card_class = styles.card_none;
          if( i ==  this.state.active_index )
            card_class = styles.card_display;

          let question = question_data.questions[i];
          let question_title = '';
          if(  question.question_prefix == 'C')
            {
              question_title = 'C-'+c+' : '+question.question;
              c++;
            }
          else
              {
                question_title = 'Q-'+q+' : '+question.question;
                q++;
          }


          if(  question.question_type == 'normal' || question.question_type == 'dynamic_choice')
          {
              let options_html  = [];
              let options = question.options;
              for(let j=0;j<options.length;j++)
              {
                options_html.push(
                  <RadioButton.Item disabled={true} value={options[j].id}  style={styles.radiolist} label={options[j].option_title} />
                )
              }
              let radio_group = <RadioButton.Group disabled={true} key={question.id} value={question.selected_option_id}    >{options_html}</RadioButton.Group>

              questions_html_arr.push(
                  <Card style={card_class} key={i}>
                  <Title style={styles.cardHeader}>
                    {question_title}
                  </Title>
                  <Card.Content>
                    {radio_group}
                  </Card.Content>
                </Card>
            )

          }

          if(  question.question_type == 'rating')
          {
              let options_html  = [];
              let options = question.options;
              for(let j=0;j<options.length;j++)
              {

                let mojiclass = styles.smile;
                if( options[j].id == question.selected_option_id )
                  mojiclass = styles.smile_selected;

                options_html.push(
                  <TouchableOpacity key={j} style={styles.mojilist} onPress={() => { }}>
                    {
                      options[j].option_emoji_id == 1 ?
                      <Image style={mojiclass} source={require('../../images/smile1.png')} />
                      :
                      null
                     }

                     {
                       options[j].option_emoji_id == 2 ?
                       <Image style={mojiclass} source={require('../../images/smile2.png')} />
                       :
                       null
                      }
                      {
                        options[j].option_emoji_id == 3 ?
                        <Image style={mojiclass} source={require('../../images/smile3.png')} />
                        :
                        null
                       }
                       {
                         options[j].option_emoji_id == 4 ?
                         <Image style={mojiclass} source={require('../../images/smile4.png')} />
                         :
                         null
                        }
                        {
                          options[j].option_emoji_id == 5 ?
                          <Image style={mojiclass} source={require('../../images/smile5.png')} />
                          :
                          null
                         }



                    <Text>{options[j].option_title}</Text>
                  </TouchableOpacity>
                )
              }
              questions_html_arr.push(

                <Card style={card_class} key={i} >
                  <Title style={styles.cardHeader}> {question_title} </Title>
                  <Card.Content>
                    <View style={styles.linebox}>
                    {options_html}
                    </View>
                  </Card.Content>
                </Card>

            )

          }

          if(  question.question_type == 'multiple')
          {

              let child_questions = question.child_questions;
              let child_questions_html = [];
              for( let m=0;m<child_questions.length;m++)
              {
                let options_html  = [];
                let options = child_questions[m].options;

                for(let j=0;j<options.length;j++)
                {
                  let button_option_class = styles.button_option;
                  let button_option_text_class = styles.button_option_text;
                  if( options[j].id == child_questions[m].selected_option_id )
                  {
                    button_option_class = styles.button_option_active;
                    button_option_text_class = styles.button_option_text_active;
                  }
                  
                  options_html.push(

                    <TouchableOpacity  onPress={( ) => {  }} style={button_option_class}>
                      <Text style={button_option_text_class}>{options[j].option_title}
                      </Text>
                      </TouchableOpacity>
                   // <RadioButton.Item value={options[j].id}  style={styles.radiolist} label={options[j].option_title} />
                  )
                }

                //let radio_group = <RadioButton.Group key={child_questions[m].id} value={child_questions[m].selected_option_id}  onValueChange={(value) => { this.set_answer_inner_obj(value,child_questions[m],m,i) }}   >{options_html}</RadioButton.Group>

                child_questions_html.push(
                  <View style={{marginBottom:15}}>
                    <View style={{ alignItems:'center' }} >
                    <Title style={styles.pagetitle}>{child_questions[m].question}</Title>
                    </View>
                   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',}}>
                   {options_html}
                   </View>  
                    </View>
                )


              }





              questions_html_arr.push(

                <Card style={card_class}>
                  <Title style={styles.boxtitle}>{question_title}</Title>
                  <Card.Content>
                    {child_questions_html}
                  </Card.Content>
                </Card>

            )

          }


          if(  question.question_type == 'multi_choice')
          {
              let options_html  = [];
              let options = question.options;
              let selected_option_id = question.selected_option_id;
              let pre_selected_option_id_arr = [];
              if( selected_option_id!='' )
              {
                 pre_selected_option_id_arr = selected_option_id.split(",");
              }

              for(let j=0;j<options.length;j++)
              {
                let option_status = "";
                if( this.inArray(options[j].id,pre_selected_option_id_arr) )
                  option_status = "checked";
                options_html.push(
                  <Checkbox.Item  disabled={true} status={option_status} label={options[j].option_title}  onPress={() => { this.set_answer_obj_multiple(options[j].id,question,i) }} />
                )
              }
              questions_html_arr.push(
                  <Card style={card_class} key={i}>
                  <Title style={styles.cardHeader}>
                    {question_title}
                  </Title>
                  <Card.Content>
                    {options_html}
                  </Card.Content>
                </Card>
            )

          }

          if(  question.question_type == 'single_choice')
          {

              let child_questions = question.child_questions;
              let child_questions_html = [];
              for( let m=0;m<child_questions.length;m++)
              {
                let options_html  = [];
                let options = child_questions[m].options;

                for(let j=0;j<options.length;j++)
                {
                  let button_option_class = styles.button_option;
                  let button_option_text_class = styles.button_option_text;
                  if( options[j].id== question.selected_option_id )
                  {
                    
                    button_option_class = styles.button_option_active;
                    button_option_text_class = styles.button_option_text_active;
                  }
                   
                  options_html.push(
                    
                    <TouchableOpacity  onPress={() => {  }} style={button_option_class}>
                    <Text style={button_option_text_class}>{options[j].option_title}</Text>
                  </TouchableOpacity>
                    //<RadioButton.Item value={options[j].id}  style={styles.radiolist} label={options[j].option_title} />
                  )
                }



                child_questions_html.push(
                  <View style={{marginBottom:15}}>
                  <View style={{ alignItems:'center' }} >
                  <Title style={styles.pagetitle}>{child_questions[m].question}</Title>
                  </View>

                  <View style={{flexDirection:'row',alignItems:'center',display:'flex',flex:1,flexWrap:'wrap'}}>
                 
                 {options_html}
                 </View>  
                  </View>
                )


              }


              //let radio_group = <RadioButton.Group key={question.id} value={question.selected_option_id}  onValueChange={(value) => { this.set_answer_obj(value,question,i) }}   >{child_questions_html}</RadioButton.Group>





              questions_html_arr.push(

                <Card style={card_class}>
                  <Title style={styles.boxtitle}>{question_title}</Title>
                  <Card.Content>
                    {child_questions_html}
                  </Card.Content>
                </Card>

            )

          }

      }

      this.setState({
        question_data : question_data,
        election_name : question_data.election_data.election_name,
        questions_html : questions_html_arr,
        total_questions : question_data.questions.length,
        name : poll_data.name,
        mobile : poll_data.mobile,
        latitude : poll_data.latitude,
        longtitude : poll_data.longtitude,
        lat_long_str : poll_data.latitude+','+poll_data.longtitude,
       
      })


  }





previous_question = async () => {

      let active_index = this.state.active_index;

      if( active_index > 0 )
      {
          let new_active_index = active_index-1;
          this.setState({
            active_index : new_active_index
          })
         
          setTimeout(() => {
              this.re_render_question();
             
          },200);
      }
      else
      {
        this.props.navigation.navigate('Pendinglist')
      }



}

next_question = async () => {


  let active_index = this.state.active_index;
  let question_data =   this.state.question_data;

    let total_questions = this.state.total_questions;
    let check_count = total_questions-1;
    if( active_index < check_count )
    {
        let new_active_index = active_index+1;
        this.setState({
          active_index : new_active_index
        })
       
        setTimeout(() => {
            this.re_render_question();
           
        },200);
    }
    if( active_index == check_count )
    {

        this.setState({
          question_area_display : false,
          upload_area_display : true
        })
    }


}

back_from_last_screen = async () => {

  this.setState({
    question_area_display : true,
    upload_area_display : false
  })

}





  render() {

    return (

      <View style={styles.container}>
      <Loader loading={this.state.loading} />

      {
        this.state.question_area_display == true ?
        <>
        <ScrollView>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image style={styles.logo} source={require('../../images/logo.png')} />
            <Text style={{ fontWeight: 'bold', }}>
            {this.state.election_name}
            </Text>
          </View>


          {this.state.questions_html}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={() => { this.previous_question() }}
            contentStyle={{ backgroundColor: '#0b353c',height:50 }}
            icon="chevron-left" mode="contained">
            Prev
          </Button>
          <Button
            onPress={() => {  this.props.navigation.navigate('Pendinglist') }}
            contentStyle={{ backgroundColor: '#0f90fa',height:50 }}
            mode="contained">
            Cancel
          </Button>

          <Button
            onPress={() => { this.next_question() }}
            contentStyle={{ flexDirection: 'row-reverse', backgroundColor: '#25904f',height:50 }}
            icon="chevron-right" mode="contained">
            Next
          </Button>
        </View>

        </>
        :
        null
      }
      {
        this.state.upload_area_display == true ?
      <>
      <ScrollView>
        <View style={{ paddingHorizontal: 20, flex: 1 }}>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image style={styles.logo} source={require('../../images/logo.png')} />
            <Text style={{ fontWeight: 'bold', }}>सर्वे : <Text style={{ color: '#0d9942' }}>2021/10</Text></Text>
          </View>


          <View style={{ marginBottom: 15 }}>
            <TextInput
              label="Email"
              placeholder="Enter Name"
              mode='outlined'
              value={this.state.name}
              onChangeText={(name ) => this.setState({name : name })}
              style={{ backgroundColor: '#fff', }}
              theme={{ colors: { primary: "#25904f" } }}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <TextInput
              label="Mobile"
              placeholder="Enter Mobile Number"
              mode='outlined'
              keyboardType="numeric"
              maxLength={10}
              maxLength={10}
              value={this.state.mobile}
              onChangeText={(mobile ) => this.setState({mobile : mobile })}
              style={{ backgroundColor: '#fff' }}
              theme={{ colors: { primary: "#25904f" } }}
            />
          </View>
          <View style={{ marginBottom: 15 }}>
            <TextInput
              label="Location"
              placeholder="Geo Location"
              mode='outlined'
              value={this.state.lat_long_str}
              style={{ backgroundColor: '#fff' }}
              theme={{ colors: { primary: "#25904f" } }}
            />
          </View>
          <View style={{ marginBottom: 15 }}>
            <Button
              theme={{ roundness: 0 }}
              contentStyle={{ flexDirection: 'row-reverse', backgroundColor: '#25904f', height: 55, }}
              icon="camera-plus-outline" mode="contained"    >
              व्यक्ति या घर की फोटो
            </Button>
          </View>

          <View style={{ marginBottom: 15 }}>
            {this.state.photo_img}
          </View>





        </View>


      </ScrollView>


      <View style={styles.footer}>
        <Button
          onPress={() => { this.back_from_last_screen() }}
          contentStyle={{ backgroundColor: '#0b353c',height:50 }}
          icon="chevron-left" mode="contained">
          Prev
        </Button>
        <Button
          onPress={() => { this.props.navigation.navigate('Pendinglist') }}
          contentStyle={{ flexDirection: 'row-reverse', backgroundColor: '#25904f',height:50 }}
          icon="check-all" mode="contained">
          DONE
        </Button>
      </View>




      </>
      :
      null
    }


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
  button_option_active:{
    padding:10,margin:5,backgroundColor:'#099943',borderRadius:4
  },
  button_option_text_active:{
    textAlign:'center',
    color:'#fff'
  },
  button_option:{
    padding:10,margin:5,borderRadius:4,
    borderWidth:1,
    borderColor:'#ddd'
  },
  button_option_text:{
    textAlign:'center',
 
  }


});
