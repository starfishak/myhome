import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

// Broker Imports & Cred
import { MQTTService } from 'ionic-mqtt'
import { MQTT_CONFIG } from './broker'
import { Rooms } from './rooms';
import { HistoryProvider } from '../../providers/history/history';

// Pages
import {AddroomPage} from "../addroom/addroom";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // Client Def
  private _client: any;
  private TOPIC: string[] = ['swen325/a3'];

  // View Components
  connection_loading = true;
  show_latest = false;
  connection_icon = 'checkmark-circle';

  // activity
  activity = {
    last_room : 'Last Activity Location Unknown',
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
  max_activity : number;

  constructor(public navCtrl: NavController, private mqttService: MQTTService, private history: HistoryProvider, private toast: ToastController) {
    this._client = this.mqttService.client;
    // this.history.removeRoom('undefined');
    // this.history.removeRoom(undefined);
  }

  ngOnInit() {
    this.histogram = {};
    this.max_activity = 2;
    this._client = this.mqttService.loadingMqtt(this.connectionLost, this.messageArrived, this.TOPIC, MQTT_CONFIG);
    this.history.getLatest().then(
      ret => {
        if (!ret == null) {
          this.activity.timestamp = new Date(ret[0]).toLocaleTimeString();
          this.activity.last_room = ret[1].charAt(0).toUpperCase() + ret[1].slice(1);
          this.activity.image = Rooms[ret[1]]
        }
      }
    );
    this.updateRoomData();
  }

  updateRoomData = () => {
    this.history.addDevices().then(
      (temp_rooms) => {
        this.rooms = [];
        for (let room of temp_rooms) {
          let room_name = room[0];
          room = room[1];
          console.log(room);
          let prior_activity = 0;
          if (this.histogram.hasOwnProperty(room_name)) {
            prior_activity = this.histogram[room_name];
          }

          let room_obj = {
            room: room[1].charAt(0).toUpperCase() + room[1].slice(1),
            room_id: room[1],
            battery: room[3],
            timestamp: room[0],
            image: Rooms[room[1]],
            activity: room[2],
            prior_activity: prior_activity
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
    this.showToast("Reconnecting to Broker...", 4000);
  };

  messageArrived = (message) => {
    this.connectSuccess();
    console.log("Message Arrived");
    console.log(message.payloadString);
    let payload = message.payloadString.split(",");

    // Check activity difference
    this.history.checkInactivity(payload[0]).then(
      res => {
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
      // Show the latest content
      this.show_latest = true;

      // Send to History Provider
      this.history.setRoomMotion(payload);

      // Set histogram motion
      if (this.histogram.hasOwnProperty(payload[1])) {
        if (payload[2] == 1) {
          this.histogram[payload[1]] += 1;
        }
      }
      else {
        this.histogram[payload[1]] = 0;
        if (payload[2] == 1) {
          this.histogram[payload[1]] = 1;
        }
      }

      // Get max histogram value
      for (let el in this.histogram) {
        console.log('el', this.histogram[el]);
        if (this.histogram[el] > this.max_activity) {
          this.max_activity = this.histogram[el]
        }
      }

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
    this.showToast("Inactivity Detected", 20000);
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

  /**
   * Opens the room add page
   */
  openAddRoom = () => {
    this.navCtrl.push(AddroomPage);
  };

  /**
   * Removes the room from the display
   */
  removeRoom = async (room) => {
    await this.history.removeRoom(room).then(
      (complete) => {
        console.log(complete);
        if (complete == undefined) {
          this.updateRoomData();
          this.showToast("Room Removed", 5000)
        }
        else {
          this.showToast("Could Not Remove Room " + complete[1], 5000)
        }
      }
    )
  }


}
