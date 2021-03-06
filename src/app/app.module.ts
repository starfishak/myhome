import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicMqttModule, MQTTService } from 'ionic-mqtt';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HistoryProvider } from '../providers/history/history';
import { IonicStorageModule } from '@ionic/storage';
import {AddroomPage} from "../pages/addroom/addroom";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AddroomPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicMqttModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AddroomPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    MQTTService,
    HistoryProvider
  ]
})
export class AppModule {}
