import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

// Broker Imports & Cred
import { MQTTService } from 'ionic-mqtt'
import { MQTT_CONFIG } from './broker'
import { Rooms } from './rooms';
import {HistoryProvider} from '../../providers/history/history';
import {copy} from "@ionic/app-scripts";

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

  // Devices-Rooms
  rooms = [];

  // Notification Delay
  lastInteraction = 0;

  constructor(public navCtrl: NavController, private mqttService: MQTTService, private history: HistoryProvider, private toast: ToastController) {
    this._client = this.mqttService.client;
  }

  ngOnInit() {
    this._client = this.mqttService.loadingMqtt(this.connectionLost, this.messageArrived, this.TOPIC, MQTT_CONFIG);
    this.history.addDevices().then(
      () => {
        let temp_rooms = this.history.getDevices();
        console.log(temp_rooms);
        // Format room objects
        for(let room of temp_rooms) {
          room = room[0];
          let room_obj = {
            room : room[1].charAt(0).toUpperCase() + room[1].slice(1),
            battery: room[3],
            timestamp: room[0],
            image : Rooms[room[1]],
            activity : room[2]
          };
          this.rooms.push(room_obj)
        }

      }
    )

  }

  connectionLost = (response) => {
    console.log('lost connection');
    console.log(response.toString());
    this.connection_icon = 'close-circle';
    this.showToast("Lost Connection with Broker", 4000);
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
      this.activity.timestamp = date.toLocaleTimeString();

      // Image
      this.activity.image = Rooms[payload[1]];
      this.activity.isActivity = true;
    }

    // Check activity difference
    this.history.checkInactivity(payload[0]).then(
      res => {
        if (res) {
          // Inactive push notification
          this.inactiveNotification();
        }
      }
    )
  };

  inactiveNotification = () => {
    let delay = 10000;
    if (this.lastInteraction >= (Date.now() - delay))
      return;
    this.lastInteraction = Date.now();
    console.log("Inactivity Detected");
    this.showToast("Inactivity Detected", 3000);
  };

  /**
   * Called upon a successful connection
   */
  connectSuccess = () => {
    console.log("success");
    this.inactiveNotification();
    this.connection_loading = false;
  };

  /**
   * Shows a notification toast on bottom of screen
   *
   * @param message to notify user
   * @param duration in milliseconds
   */
  showToast = (message, duration) => {
    let toast_notification = this.toast.create({
      message: message,
      duration: duration,
      position: 'bottom'
    });

    toast_notification.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast_notification.present();
  };
}
