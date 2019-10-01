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

  /**
   * Sets the most recent activity key and stores the movement information in the localstorage module
   * @param data array data payload containing sensor information. format: [timestamp, room, status, battery]
   */
  setRoomMotion = (data : Array<any>) => {
    this.storage.set('latest', data).then(
      () => {
        this.storage.get(data[1]).then(
          (ret) => {
            ret[data[0]] = data;
          }
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
        let latest_date = new Date(ret[0]).getTime();
        timestamp = new Date(timestamp).getTime();
        let timestamp_difference = timestamp - latest_date;
        let difference = Math.floor( timestamp_difference / (1000*60));
        return difference >= 5;
      }
    )
  }
}
