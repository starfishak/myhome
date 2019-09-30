import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

// Broker Imports & Cred
import { MQTTService } from 'ionic-mqtt'
import { MQTT_CONFIG } from './broker'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // Client Def
  private _client = null;
  private TOPIC: string[] = ['swen325/a3'];

  // View Components
  connection_loading = true;
  connection_icon = 'checkmark-circle';


  constructor(public navCtrl: NavController, private mqttService: MQTTService) {
    this._client = this.mqttService.client;
  }

  ngOnInit() {
    this._client = this.mqttService.loadingMqtt(this.connectionLost, this.messageArrived, this.TOPIC, MQTT_CONFIG);
  }

  connectionLost = (response) => {
    console.log('lost connection');
    console.log(response.toString());
    this.connection_icon = 'close-circle'
  };

  messageArrived = (message) => {
    this.connectSuccess();
    console.log("Message Arrived");
    console.log(message);
    console.log(message.payloadString);
  };

  connectSuccess = () => {
    console.log("success");
    this.connection_loading = false;

  }
}
