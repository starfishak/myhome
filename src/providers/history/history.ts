import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

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
        this.storage.set(data[1], data).then(
          () => {}
        );
      }
    );
  };

  /**
   * Compares the provided timestamp to the latest timestamp
   *
   * @param timestamp to compare the latest timestamp to
   * @return promise time difference
   */
  checkInactivity = (timestamp) => {
    console.log('checkinactivity called');
    return this.storage.get('latest').then(
      ret => {
        console.log(ret);
        let latest_date = new Date(ret[0]).getTime();
        timestamp = new Date(timestamp).getTime();
        let timestamp_difference = timestamp - latest_date;
        console.log(timestamp_difference);
        let difference = Math.floor( timestamp_difference / 1000 / 60);
        console.log("difference", difference);
        return [difference, difference >= 3];
      }
    )
  };

  addDevices = () => {
    let rooms = [];
    return this.storage.forEach(
      (key, value) => {
        if (value != "latest" && value != 'location') {
          rooms.push([value, key])
        }
      }
    ).then(
      () => {
        return rooms
      }
    )
  };

  getLatest = () => {
    return this.storage.get('latest').then(
      (ret) => {
        return ret;
      }
    )
  };

  addRoom = async (roomname) => {
    let generic_data = [new Date(), roomname, 0, -1];
    await this.storage.set(roomname, generic_data);
  };

  removeRoom(room: any) {
    console.log('room', room);
    return this.storage.get(room).then(
     res => {
       console.log('res', res);
       if (res[3] < 0) {
         this.storage.remove(room).then(
           () => {
             return [true, room]
           }
         )
       }
       else {
         return [false, room];
       }
     }
   )

    // return this.storage.remove(room).then(
    //   () => {
    //     return true;
    //   }
    // );
  }
}
