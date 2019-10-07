import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

// Broker Imports & Cred
import { MQTTService } from 'ionic-mqtt'
import { MQTT_CONFIG } from './broker'
import { Rooms } from './rooms';
import { HistoryProvider } from '../../providers/history/history';

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
    last_room : 'Last Activity Location Un',
    battery : null,
    timestamp : '',
    isActivity: false,
    image: '',
    time_since_active : 0
  };

  // Devices-Rooms
  rooms = [];

  // Notification Delay
  lastInteraction = 0;
  inactivityShown = false;

  // Room Motion Histogram
  histogram : object;

  constructor(public navCtrl: NavController, private mqttService: MQTTService, private history: HistoryProvider, private toast: ToastController) {
    this._client = this.mqttService.client;
  }

  ngOnInit() {
    this.histogram = {};
    this._client = this.mqttService.loadingMqtt(this.connectionLost, this.messageArrived, this.TOPIC, MQTT_CONFIG);
    this.history.getLatest().then(
      ret => {
        this.activity.timestamp = new Date(ret[0]).toLocaleTimeString();
        this.activity.last_room = ret[1].charAt(0).toUpperCase() + ret[1].slice(1);
        this.activity.image = Rooms[ret[1]]
      }
    );
    this.updateRoomData();
  }

  updateRoomData = () => {
    this.rooms = [];
    this.history.addDevices().then(
      () => {
        let temp_rooms = this.history.getDevices();
        console.log('temp_rooms',temp_rooms);
        // Format room objects
        for (let room of temp_rooms) {
          this.histogram[room[1]] = 0;
          room = room[0];
          let room_obj = {
            room: room[1].charAt(0).toUpperCase() + room[1].slice(1),
            battery: room[3],
            timestamp: room[0],
            image: Rooms[room[1]],
            activity: room[2],
            prior_activity: this.histogram[room[1]]
          };
          this.rooms.push(room_obj);
        }
      }
    );
  };

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

    // Check activity difference
    console.log('payload',payload[0]);
    this.history.checkInactivity(payload[0]).then(
      res => {
        console.log("result", res);
        // @ts-ignore
        this.activity.time_since_active = res[0];
        if (res[1]) {
          // Inactive push notification
          this.inactiveNotification();
        }
      }
    );

    // If room is changed, post as latest activity
    if (payload[2] == 1) {
      // Send to History Provider
      this.history.setRoomMotion(payload);

      // Set histogram motion
      this.histogram[payload[1]]++;
      console.log("histogram\n",this.histogram);
      // Reset Push Notification
      this.inactivityShown = false;

      this.activity.last_room = payload[1].charAt(0).toUpperCase() + payload[1].slice(1);
      this.activity.battery = payload[3];

      // Timestamp
      let date = new Date(payload[0]);
      this.activity.timestamp = date.toLocaleTimeString();

      // Image
      this.activity.image = Rooms[payload[1]];
      this.activity.isActivity = true;
    }

    // Update Rooms
    this.updateRoomData();

  };

  inactiveNotification = () => {
    let delay = 10000;
    if (this.lastInteraction >= (Date.now() - delay) || this.inactivityShown)
      return;
    this.lastInteraction = Date.now();
    this.inactivityShown = true;
    this.showToast("Inactivity Detected", 5000);
  };

  /**
   * Called upon a successful connection
   */
  connectSuccess = () => {
    console.log("success");
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
      // this.navCtrl.push("home");
    });

    toast_notification.present();
  };
}
