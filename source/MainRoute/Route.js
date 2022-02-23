import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Splash from '../components/SplashScreen/Splash';
import Intro from '../components/Intro/Intro';
import MainScreen from '../components/MainScreen/MainScreen';

import Question from '../components/Question/Question';
import Zone from '../components/Zone/Zone';
import Members from '../components/Members/Members';
import Createaccount from '../components/Createaccount/Createaccount';
import Pendinglist from '../components/Pendinglist/Pendinglist';
import Questionreview from '../components/Questionreview/Questionreview';
import Editaccount from '../components/Editaccount/Editaccount';
import Notifications from '../components/Notifications/Notifications';

import Pendinglistlive from '../components/Pendinglistlive/Pendinglistlive';






const RootStack = createStackNavigator(
  {
    Splash: Splash,
    Intro:Intro,
    MainScreen: MainScreen,
    Question : Question,
    Zone : Zone,
    Members : Members,
    Createaccount : Createaccount,
    Pendinglist,Pendinglist,
    Questionreview : Questionreview,
    Editaccount : Editaccount,
    Notifications : Notifications,
    Pendinglistlive : Pendinglistlive

  },
  {
    initialRouteName: 'Splash',
  },
);

const AppContainer = createAppContainer(RootStack);
export default AppContainer;
