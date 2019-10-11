import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HistoryProvider} from "../../providers/history/history";
import {HomePage} from "../home/home";

@IonicPage()
@Component({
  selector: 'page-addroom',
  templateUrl: 'addroom.html',
})

export class AddroomPage {
  // Instance Variables
  room_data : object = {title:''};

  constructor(public navCtrl: NavController, public navParams: NavParams, private historyService : HistoryProvider) {
  }

  /**
   * Called when users submits form
   * Sends the room name to the local storage api (history provider)
   */
  addRoom() {
    // @ts-ignore
    console.log('title', this.room_data.title);
    // @ts-ignore
    this.historyService.addRoom(this.room_data.title);
    this.navCtrl.push(HomePage);
    // console.log(this.room_data)
  }

}
