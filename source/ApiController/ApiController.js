import {Buffer} from 'buffer';
import AsyncStorage from '@react-native-community/async-storage';


class Api {
  static headers() {

    return {
      'Purchase-Code': 12,
      'Custom-Security': 12,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept' : '*/*',
      'Login-type':'TCM',
    }
  }
  static msg(msg) {
    return console.warn(msg);
  }
  static get(route) {
    return this.func(route, null, 'GET');
  }

  static put(route, params) {
    return this.func(route, params, 'PUT')
  }

  static post(route, params) {

    return this.func(route, params, 'POST')
  }

  static delete(route, params) {
    return this.func(route, params, 'DELETE')
  }
  static hostname(){
  const host = 'https://new.pollfirstsurveys.com/api';
  return host;
}
  static func = async(route, params, verb) => {

    const searchParams = Object.keys(params).map((key) => {
  return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
}).join('&');
    const host = 'https://new.pollfirstsurveys.com/api';
    const url = `${host}/${route}`
    let options = Object.assign({ method: verb }, searchParams ? { body: searchParams } : null);
    options.headers = Api.headers()
    return fetch(url, options).then(resp => {
      if (resp.ok) {
        return resp.text();
        
      }
      return json.then(err => { throw err });
    }).then(json => {
      // console.log("api response",json);
      let jsonData = JSON.parse(json);
      return jsonData;
    });
  }
}





export default Api;
