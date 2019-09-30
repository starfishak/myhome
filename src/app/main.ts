import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

import { Paho, IonicMqttModule, MQTTService } from 'ionic-mqtt'

platformBrowserDynamic().bootstrapModule(AppModule);


// let client = new Paho.MQTT.Client(location.hostname, Number(location.port), "clientId");
