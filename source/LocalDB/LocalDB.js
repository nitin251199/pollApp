// import { AsyncStorage } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage";

class LocalDB {
  static async saveNotifications(data) {
    try {
      await AsyncStorage.setItem(
        "poll_notification_data",
        JSON.stringify(data)
      );
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async getNotifications() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("poll_notification_data")) || null;
      const userProfile = JSON.parse(item);
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async saveZcAccounts(data) {
    try {
      await AsyncStorage.setItem("zv_accounts_data", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async getZcAccounts() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("zv_accounts_data")) || null;
      const userProfile = JSON.parse(item);
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async saveUserZoneData(data) {
    try {
      await AsyncStorage.setItem("user_zone_data", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async getUserZoneData() {
    let item = {};
    try {
      item = await AsyncStorage.getItem("user_zone_data");
      const userProfile = JSON.parse(item);
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", userProfile);
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async saveCandidateData(data) {
    try {
      await AsyncStorage.setItem("candidate_data", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async getAllCandidateData() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("candidate_data")) || null;
      const userProfile = JSON.parse(item);
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async saveAllZoneData(data) {
    try {
      await AsyncStorage.setItem("zones_data", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async getAllZoneData() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("zones_data")) || null;
      const userProfile = JSON.parse(item);
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async save_uploaded_sample(data) {
    try {
      await AsyncStorage.setItem("poll_data_uploaded", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async get_uploaded_sample() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("poll_data_uploaded")) || null;
      const userProfile = JSON.parse(item);
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async saveSurvayData(data) {
    try {
      await AsyncStorage.setItem("poll_data", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async getSurvayData() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("poll_data")) || null;
      const userProfile = JSON.parse(item); 
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async saveProfile(data) {
    try {
      await AsyncStorage.setItem("poll_profile", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async saveAllQuestionsData(data) {
    try {
      await AsyncStorage.setItem("poll_questions_data", JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(error.message);
      return false;
    }
  }

  static async getAllQuestionsData() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("poll_questions_data")) || null;
      const userProfile = JSON.parse(item);
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async getUserProfile() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("poll_profile")) || null;
      const userProfile = JSON.parse(item);
      return userProfile;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async saveIsProfilePublic(isPublic) {
    try {
      await AsyncStorage.setItem("isPublic", isPublic);
    } catch (error) {
      console.warn(error.message);
    }
  }
  static async isProfilePublic() {
    const isPublic = (await AsyncStorage.getItem("isPublic")) || null;
    if (isPublic === "1") return true;
    else return false;
  }
  static async saveSeries(question, time, id) {
    let series = [];
    let insert = true;
    //alert("insidser");
    //await AsyncStorage.setItem('ExamTestseries',null);
    let olddata = (await AsyncStorage.getItem("DealTestseries5")) || null;
    const olditemdata = JSON.parse(olddata);

    if (olddata != null) {
      olditemdata.map((item) => {
        if (item.id === id) {
          item.question = question;
          item.time = time;
          insert = false;
        }
      });

      series = olditemdata;
    }

    if (insert) {
      //alert("insidser");
      let params = {
        id: id,
        time: time,
        question: question,

        //password: this.state.password
      };
      series.push(params);

      //  alert(JSON.stringify(series));
    }

    await AsyncStorage.setItem("DealTestseries5", JSON.stringify(series));
    return true;
  }

  static async getSeries(id) {
    let itemlist = null;
    try {
      item = (await AsyncStorage.getItem("DealTestseries5")) || null;
      const examlisting = JSON.parse(item);
      //alert(item);
      if (item != null) {
        examlisting.map((item) => {
          if (item.id === id) {
            itemlist = item;
          }
        });
      }

      return itemlist;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }

  static async saveDeal(data) {
    //console.warn('data==>>', data);
    try {
      await AsyncStorage.setItem("examlisting", JSON.stringify(data));
      return true;
    } catch (error) {
      // Error retrieving data
      console.warn(error.message);
      return false;
    }
  }

  static async getDeal() {
    let item = {};
    try {
      item = (await AsyncStorage.getItem("examlisting")) || null;
      const examlisting = JSON.parse(item);
      return examlisting;
    } catch (error) {
      console.warn(error.message);
      return null;
    }
  }
}

export default LocalDB;
