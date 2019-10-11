import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddroomPage } from './addroom';

@NgModule({
  declarations: [
    AddroomPage,
  ],
  imports: [
    IonicPageModule.forChild(AddroomPage),
  ],
})
export class AddroomPageModule {}
