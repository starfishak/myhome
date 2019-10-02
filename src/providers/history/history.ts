import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/*
  Generated class for the HistoryProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HistoryProvider {

  constructor(private storage : Storage) {
    console.log('Hello HistoryProvider Provider');
  }

  // Temp Storage Variables
  private rooms : any;

  /**
   * Sets the most recent activity key and stores the movement information in the localstorage module
   * @param data array data payload containing sensor information. format: [timestamp, room, status, battery]
   */
  setRoomMotion = (data : Array<any>) => {
    this.storage.set('latest', data).then(
      () => {
        this.storage.set(data[1], data).then(
          () => {}
        );
      }
    );
  };

  /**
   *
   * @param timestamp to compare the latest timestamp to
   * @return promise time difference
   */
  checkInactivity = (timestamp) => {
    return this.storage.get('latest').then(
      ret => {
        if (ret == null) {
          return
        }
        console.log(ret);
        let latest_date = new Date(ret[0]).getTime();
        timestamp = new Date(timestamp).getTime();
        let timestamp_difference = timestamp - latest_date;
        console.log(timestamp_difference);
        let difference = Math.floor( timestamp_difference / 1000 / 60);
        console.log("difference", difference);
        return [difference, difference >= 5];
      }
    )
  };

  addDevices = () => {
    this.rooms = [];

    return this.storage.forEach(
      (key, value) => {
        if (value != "latest" && value != 'location') {
          this.rooms.push([key, value])
        }
      }
    )
  };

  getDevices = () => {
    return this.rooms;
  };

  getLatest = () => {
    return this.storage.get('latest').then(
      (ret) => {
        return ret;
      }
    )
  }
}
