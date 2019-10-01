import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { ToastController } from 'ionic-angular';

// Broker Imports & Cred
import { MQTTService } from 'ionic-mqtt'
import { MQTT_CONFIG } from './broker'
import { Rooms } from './rooms';
import {HistoryProvider} from '../../providers/history/history';

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

  // activity
  activity = {
    last_room : 'No Recent Activity',
    battery : null,
    timestamp : '',
    isActivity: false,
    image: ''
  };


  constructor(public navCtrl: NavController, private mqttService: MQTTService, private history: HistoryProvider) {
    this._client = this.mqttService.client;
  }

  ngOnInit() {
    this._client = this.mqttService.loadingMqtt(this.connectionLost, this.messageArrived, this.TOPIC, MQTT_CONFIG);
  }

  connectionLost = (response) => {
    console.log('lost connection');
    console.log(response.toString());
    this.connection_icon = 'close-circle';
  };

  messageArrived = (message) => {
    this.connectSuccess();
    console.log("Message Arrived");
    console.log(message.payloadString);
    let payload = message.payloadString.split(",");
    /**
     * Payload
     * [timestamp, room, status, battery]
     */
    // If room is changed, post as latest activity
    if (payload[2] == 1) {
      // Send to History Provider
      this.history.setRoomMotion(payload);

      this.activity.last_room = payload[1].charAt(0).toUpperCase() + payload[1].slice(1);
      this.activity.battery = payload[3];

      // Timestamp
      let date = new Date(payload[0]);
      this.activity.timestamp = date.toLocaleDateString();

      // Image
      this.activity.image = Rooms[payload[1]];
      this.activity.isActivity = true;
    }

  };

  connectSuccess = () => {
    console.log("success");
    this.connection_loading = false;

  }
}
