import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as $ from 'jquery';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

  // runs auto sizing on description field for timers. Fields need to be set up (set up is run in javascript in timer component)
$(document)
  .on('input.autoExpand', 'textarea.autoExpand', () => {
    const target: any = event.target;
    target.style.height = '0px';
    target.style.height = target.scrollHeight + 2 + 'px';
  });
